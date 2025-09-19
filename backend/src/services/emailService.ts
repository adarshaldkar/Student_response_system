import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password?token=${resetToken}`;
    
    // Check if email is properly configured
    const isEmailConfigured = process.env.SMTP_USER && 
                             process.env.SMTP_PASS && 
                             process.env.SMTP_USER !== 'your-email@gmail.com' &&
                             process.env.SMTP_PASS !== 'your-app-password';
    
    if (!isEmailConfigured) {
      console.log('\n=================================');
      console.log('📧 EMAIL NOT CONFIGURED - SHOWING RESET LINK');
      console.log('=================================');
      console.log(`👤 Email: ${email}`);
      console.log(`🔗 Reset Link: ${resetUrl}`);
      console.log('=================================');
      console.log('📝 To enable email delivery:');
      console.log('1. Set up Gmail App Password');
      console.log('2. Update SMTP_USER and SMTP_PASS in .env');
      console.log('3. Restart the backend server');
      console.log('=================================\n');
      // Don't throw error, just log the reset link
      return;
    }
    
    const mailOptions = {
      from: {
        name: 'Student Feedback System',
        address: process.env.SMTP_USER || 'noreply@feedback-system.com'
      },
      to: email,
      subject: 'Password Reset Request - Student Feedback System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .button:hover { background-color: #2563eb; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
            .warning { background-color: #fef3cd; border: 1px solid #f6e05e; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>We received a request to reset your password for your Student Feedback System admin account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This reset link will expire in <strong>1 hour</strong></li>
                  <li>This link can only be used once</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
              </p>
              
              <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>Student Feedback System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Student Feedback System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Student Feedback System
        
        Hello ${username},
        
        We received a request to reset your password for your Student Feedback System admin account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        Important:
        - This reset link will expire in 1 hour
        - This link can only be used once
        - If you didn't request this reset, please ignore this email
        
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
        
        Best regards,
        Student Feedback System Team
        
        ---
        This is an automated message. Please do not reply to this email.
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent successfully to: ${email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      console.warn(`Fallback - Reset URL for ${email}: ${resetUrl}`);
      // Don't throw error to prevent 500 response, just log the reset link
      // throw new Error('Failed to send password reset email');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
