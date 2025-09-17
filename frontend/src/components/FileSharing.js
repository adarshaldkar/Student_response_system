import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Upload, 
  Download, 
  Send, 
  Search, 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye,
  Loader2,
  X,
  Users,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Force localhost for development
const BACKEND_URL = 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Debug logging
console.log('FileSharing - Backend URL:', BACKEND_URL);
console.log('FileSharing - API base:', API);
console.log('FileSharing - Environment REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);

const FileSharing = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('FileSharing useEffect - Current user:', user);
    console.log('FileSharing useEffect - User role:', user?.role);
    console.log('FileSharing useEffect - Backend URL:', BACKEND_URL);
    console.log('FileSharing useEffect - API URL:', API);
    
    if (!user || user.role !== 'admin') {
      console.warn('FileSharing - User is not admin, skipping API calls');
      toast.error('Admin access required', {
        description: 'Please login as an admin user to access file sharing',
        duration: 5000,
      });
      return;
    }
    
    // Add small delay to ensure everything is initialized
    const initializeFileSharing = async () => {
      try {
        await Promise.all([
          fetchAdmins(),
          fetchReceivedFiles(),
          fetchSentFiles(),
          fetchUnreadCount()
        ]);
        console.log('✅ All file sharing data loaded successfully');
      } catch (error) {
        console.error('❌ Error initializing file sharing:', error);
        toast.error('Failed to initialize file sharing', {
          description: 'Please refresh the page or check your connection',
          duration: 5000,
        });
      }
    };
    
    setTimeout(initializeFileSharing, 500);
    
    // Setup Socket.IO connection
    const newSocket = io(BACKEND_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 5000
    });
    
    setSocket(newSocket);
    
    if (user?.id) {
      newSocket.emit('join', user.id);
    }
    
    // Listen for real-time events
    newSocket.on('fileReceived', (data) => {
      toast.success('New file received!', {
        description: `${data.senderUsername} sent you ${data.fileName}`,
        duration: 5000,
      });
      fetchReceivedFiles();
    });
    
    newSocket.on('chatMessage', (data) => {
      if (activeChat && data.senderId === activeChat.id) {
        setChatMessages(prev => [...prev, data]);
      }
      toast.info('New message', {
        description: `${data.senderUsername}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`,
        duration: 4000,
      });
      fetchUnreadCount();
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, activeChat]);
  
  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', {
          description: 'Please login to access file sharing',
          duration: 4000,
        });
        return;
      }
      
      console.log('Fetching admins from:', `${API}/fileshare/admins`);
      const response = await axios.get(`${API}/fileshare/admins`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        withCredentials: false
      });
      
      console.log('Admins response:', response.data);
      setAdmins(response.data.admins || []);
      setFilteredAdmins(response.data.admins || []);
      
      if (response.data.admins && response.data.admins.length === 0) {
        toast.info('No other admin users found', {
          description: 'You are the only admin user in the system',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed', {
          description: 'Please login again to continue',
          duration: 5000,
        });
        // Clear invalid token
        localStorage.removeItem('token');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found', {
          description: 'File sharing service may not be available',
          duration: 5000,
        });
      } else {
        toast.error('Failed to load admin users', {
          description: error.response?.data?.detail || 'Please check your connection and try again',
          duration: 5000,
        });
      }
    }
  };

  const fetchReceivedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API}/fileshare/received`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        withCredentials: false
      });
      setReceivedFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch received files:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load received files');
      }
    }
  };

  const fetchSentFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API}/fileshare/sent`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        withCredentials: false
      });
      setSentFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch sent files:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load sent files');
      }
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/fileshare/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchChatMessages = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/fileshare/chat/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Only Excel files (.xlsx, .xls) are allowed',
          duration: 4000,
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'File size must be less than 10MB',
          duration: 4000,
        });
        return;
      }
      
      setSelectedFile(file);
      toast.success('File attached!', {
        description: `${file.name} is ready to share`,
        duration: 3000,
      });
    }
  };

  const handleFileShare = async () => {
    if (!selectedFile || !selectedAdmin) {
      toast.error('Missing requirements', {
        description: 'Please select a file and choose an admin to share with',
        duration: 4000,
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('receiverId', selectedAdmin.id);
      formData.append('message', shareMessage);

      const token = localStorage.getItem('token');
      await axios.post(`${API}/fileshare/share`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('File shared successfully!', {
        description: `${selectedFile.name} has been sent to ${selectedAdmin.username}`,
        duration: 4000,
      });

      // Reset form
      setSelectedFile(null);
      setSelectedAdmin(null);
      setShareMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh sent files
      fetchSentFiles();
      
    } catch (error) {
      console.error('Failed to share file:', error);
      toast.error('Failed to share file', {
        description: error.response?.data?.detail || 'Please try again',
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/fileshare/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started!', {
        description: `${fileName} is downloading`,
        duration: 3000,
      });
      
      // Refresh files to update view status
      fetchReceivedFiles();
      
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Download failed', {
        description: 'Please try again',
        duration: 4000,
      });
    }
  };

  const handleChatOpen = (admin) => {
    setActiveChat(admin);
    setShowChat(true);
    fetchChatMessages(admin.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/fileshare/chat/send`, {
        receiverId: activeChat.id,
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChatMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Sending';
      case 'delivered':
        return 'Delivered';
      case 'viewed':
        return 'Viewed';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading file sharing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upload" className="text-sm font-medium">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="received" className="text-sm font-medium">
              <Download className="h-4 w-4 mr-2" />
              Received Files
              {receivedFiles.filter(f => f.status !== 'viewed').length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {receivedFiles.filter(f => f.status !== 'viewed').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-sm font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Sent Files
            </TabsTrigger>
          </TabsList>
          
          <Button
            onClick={() => {
              fetchAdmins();
              fetchReceivedFiles(); 
              fetchSentFiles();
              fetchUnreadCount();
              toast.success('Data refreshed!');
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Upload File Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Excel File with Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Step 1: Attach Excel File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to select Excel file
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Only .xlsx and .xls files are allowed (max 10MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">{selectedFile.name}</span>
                        <span className="text-green-600 text-sm">({formatFileSize(selectedFile.size)})</span>
                      </div>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                )}
              </div>

              {/* Admin Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Step 2: Select Admin to Share With
                  <Badge variant="outline" className="ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    {filteredAdmins.length}
                  </Badge>
                </Label>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Admin List */}
                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-2 space-y-2">
                    {filteredAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        onClick={() => setSelectedAdmin(admin)}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                          selectedAdmin?.id === admin.id
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{admin.username}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChatOpen(admin);
                              }}
                              title="Start chat"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Step 3: Add Message (Optional)</Label>
                <Textarea
                  placeholder="Enter a message to send with the file..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleFileShare}
                disabled={!selectedFile || !selectedAdmin || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending File...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send This File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Received Files Tab */}
        <TabsContent value="received">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Received Files
                <Badge variant="outline" className="ml-2">
                  {receivedFiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receivedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No files received yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedFiles.map((file) => (
                    <div key={file.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium text-gray-900">{file.fileName}</h3>
                            {file.status !== 'viewed' && (
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500 space-y-1">
                            <p>From: <span className="font-medium">{file.senderUsername}</span></p>
                            <p>Size: {formatFileSize(file.fileSize)}</p>
                            <p>Received: {new Date(file.sentAt).toLocaleString()}</p>
                            {file.message && (
                              <p className="text-gray-700">Message: "{file.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            {getStatusIcon(file.status)}
                            <span>{getStatusText(file.status)}</span>
                          </div>
                          <Button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Files Tab */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Sent Files
                <Badge variant="outline" className="ml-2">
                  {sentFiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No files sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentFiles.map((file) => (
                    <div key={file.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium text-gray-900">{file.fileName}</h3>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 space-y-1">
                            <p>To: <span className="font-medium">{file.receiverUsername}</span></p>
                            <p>Size: {formatFileSize(file.fileSize)}</p>
                            <p>Sent: {new Date(file.sentAt).toLocaleString()}</p>
                            {file.message && (
                              <p className="text-gray-700">Message: "{file.message}"</p>
                            )}
                            {file.deliveredAt && (
                              <p>Delivered: {new Date(file.deliveredAt).toLocaleString()}</p>
                            )}
                            {file.viewedAt && (
                              <p>Viewed: {new Date(file.viewedAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          {getStatusIcon(file.status)}
                          <span className="text-gray-600">{getStatusText(file.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat with {activeChat?.username}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-2 rounded-lg text-sm ${
                        msg.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Chat Button */}
      {unreadCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowChat(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
            size="sm"
          >
            <MessageCircle className="h-5 w-5" />
            <Badge variant="destructive" className="ml-1 text-xs">
              {unreadCount}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileSharing;
