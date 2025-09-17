import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileShare, FileShareStatus } from '../models/FileShare';
import { Chat } from '../models/Chat';
import { User, UserRole } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../utils/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/shared-files');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow Excel files
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all admin users - GET /api/fileshare/admins
router.get('/admins', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.userId;
    
    // Get all admin users except current user
    const admins = await User.find({ 
      role: UserRole.ADMIN,
      id: { $ne: currentUserId }
    }, 'id username email createdAt').sort({ username: 1 });
    
    return res.json({
      admins: admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt
      }))
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Upload and share file - POST /api/fileshare/share
router.post('/share', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, message } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }
    
    if (!receiverId) {
      return res.status(400).json({ detail: 'Receiver ID is required' });
    }
    
    // Get sender info
    const sender = await User.findOne({ id: senderId });
    const receiver = await User.findOne({ id: receiverId });
    
    if (!sender || !receiver) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    if (receiver.role !== UserRole.ADMIN) {
      return res.status(400).json({ detail: 'Files can only be shared with admin users' });
    }
    
    // Create file share record
    const fileShare = new FileShare({
      id: uuidv4(),
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      senderId: sender.id,
      senderUsername: sender.username,
      receiverId: receiver.id,
      receiverUsername: receiver.username,
      message: message || '',
      status: FileShareStatus.PENDING
    });
    
    await fileShare.save();
    
    // Emit real-time notification to receiver
    const io = req.app.get('io');
    if (io) {
      io.to(receiver.id).emit('fileReceived', {
        id: fileShare.id,
        fileName: fileShare.originalFileName,
        senderUsername: fileShare.senderUsername,
        message: fileShare.message,
        sentAt: fileShare.sentAt
      });
    }
    
    return res.json({
      id: fileShare.id,
      fileName: fileShare.originalFileName,
      fileSize: fileShare.fileSize,
      receiverUsername: fileShare.receiverUsername,
      message: fileShare.message,
      sentAt: fileShare.sentAt,
      status: fileShare.status
    });
    
  } catch (error) {
    console.error('Share file error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get sent files - GET /api/fileshare/sent
router.get('/sent', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const senderId = req.user?.userId;
    
    const sentFiles = await FileShare.find({ senderId })
      .sort({ sentAt: -1 })
      .limit(50);
    
    return res.json({
      files: sentFiles.map(file => ({
        id: file.id,
        fileName: file.originalFileName,
        fileSize: file.fileSize,
        receiverUsername: file.receiverUsername,
        message: file.message,
        sentAt: file.sentAt,
        status: file.status,
        deliveredAt: file.deliveredAt,
        viewedAt: file.viewedAt
      }))
    });
    
  } catch (error) {
    console.error('Get sent files error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get received files - GET /api/fileshare/received
router.get('/received', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const receiverId = req.user?.userId;
    
    const receivedFiles = await FileShare.find({ receiverId })
      .sort({ sentAt: -1 })
      .limit(50);
    
    // Update status to delivered for files that haven't been delivered yet
    await FileShare.updateMany(
      { receiverId, status: FileShareStatus.PENDING },
      { 
        $set: { 
          status: FileShareStatus.DELIVERED,
          deliveredAt: new Date()
        }
      }
    );
    
    return res.json({
      files: receivedFiles.map(file => ({
        id: file.id,
        fileName: file.originalFileName,
        fileSize: file.fileSize,
        senderUsername: file.senderUsername,
        message: file.message,
        sentAt: file.sentAt,
        status: file.status === FileShareStatus.PENDING ? FileShareStatus.DELIVERED : file.status,
        deliveredAt: file.deliveredAt || new Date(),
        viewedAt: file.viewedAt
      }))
    });
    
  } catch (error) {
    console.error('Get received files error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Download file - GET /api/fileshare/download/:fileId
router.get('/download/:fileId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    const fileId = req.params.fileId;
    
    const fileShare = await FileShare.findOne({ id: fileId });
    
    if (!fileShare) {
      return res.status(404).json({ detail: 'File not found' });
    }
    
    // Check if user is sender or receiver
    if (fileShare.senderId !== userId && fileShare.receiverId !== userId) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(fileShare.filePath)) {
      return res.status(404).json({ detail: 'File not found on server' });
    }
    
    // Update status to viewed if user is receiver and file hasn't been viewed
    if (fileShare.receiverId === userId && fileShare.status !== FileShareStatus.VIEWED) {
      fileShare.status = FileShareStatus.VIEWED;
      fileShare.viewedAt = new Date();
      await fileShare.save();
    }
    
    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="${fileShare.originalFileName}"`);
    res.setHeader('Content-Type', fileShare.mimeType);
    
    return res.sendFile(path.resolve(fileShare.filePath));
    
  } catch (error) {
    console.error('Download file error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Send chat message - POST /api/fileshare/chat/send
router.post('/chat/send', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, message } = req.body;
    
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ detail: 'Receiver ID and message are required' });
    }
    
    // Get sender and receiver info
    const sender = await User.findOne({ id: senderId });
    const receiver = await User.findOne({ id: receiverId });
    
    if (!sender || !receiver) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    if (receiver.role !== UserRole.ADMIN) {
      return res.status(400).json({ detail: 'Messages can only be sent to admin users' });
    }
    
    // Create chat message
    const chat = new Chat({
      id: uuidv4(),
      senderId: sender.id,
      senderUsername: sender.username,
      receiverId: receiver.id,
      receiverUsername: receiver.username,
      message: message.trim()
    });
    
    await chat.save();
    
    // Emit real-time chat message to receiver
    const io = req.app.get('io');
    if (io) {
      io.to(receiver.id).emit('chatMessage', {
        id: chat.id,
        senderId: chat.senderId,
        senderUsername: chat.senderUsername,
        message: chat.message,
        sentAt: chat.sentAt
      });
    }
    
    return res.json({
      id: chat.id,
      senderId: chat.senderId,
      senderUsername: chat.senderUsername,
      receiverId: chat.receiverId,
      receiverUsername: chat.receiverUsername,
      message: chat.message,
      sentAt: chat.sentAt,
      isRead: chat.isRead
    });
    
  } catch (error) {
    console.error('Send chat message error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get chat messages between two users - GET /api/fileshare/chat/:userId
router.get('/chat/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.userId;
    const otherUserId = req.params.userId;
    
    // Get messages between current user and other user
    const messages = await Chat.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ sentAt: 1 }).limit(100);
    
    // Mark messages as read if current user is receiver
    await Chat.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    return res.json({
      messages: messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        senderUsername: msg.senderUsername,
        receiverId: msg.receiverId,
        receiverUsername: msg.receiverUsername,
        message: msg.message,
        sentAt: msg.sentAt,
        isRead: msg.isRead,
        readAt: msg.readAt
      }))
    });
    
  } catch (error) {
    console.error('Get chat messages error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get unread message count - GET /api/fileshare/chat/unread-count
router.get('/chat/unread-count', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    const unreadCount = await Chat.countDocuments({
      receiverId: userId,
      isRead: false
    });
    
    return res.json({ unreadCount });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
