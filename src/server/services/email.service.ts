import nodemailer from 'nodemailer';

interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      if (this.config.auth?.user && this.config.auth?.pass) {
        this.transporter = nodemailer.createTransporter(this.config);
      } else {
        console.warn('Email service not configured. SMTP credentials missing.');
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email transporter not available. Email not sent.');
      return false;
    }

    try {
      const emailOptions = {
        from: options.from || process.env.SMTP_FROM || 'noreply@researchhub.com',
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      await this.transporter.sendMail(emailOptions);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Study invitation email template
  generateInvitationEmail(participantName: string, studyTitle: string, invitationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .highlight { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔬 ResearchHub</h1>
            <p>You're invited to participate in a research study</p>
          </div>
          <div class="content">
            <h2>Hello ${participantName}!</h2>
            <p>You've been invited to participate in the following research study:</p>
            
            <div class="highlight">
              <h3>📋 ${studyTitle}</h3>
            </div>
            
            <p>Your participation will help advance research and understanding in this important area. The study is designed to be engaging and your insights are valuable.</p>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>✅ Secure and confidential participation</li>
              <li>⏱️ Flexible timing that works for you</li>
              <li>🎯 Clear instructions and guidance</li>
              <li>📊 Contributing to meaningful research</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Accept Invitation & Start Study</a>
            </div>
            
            <p style="margin-top: 30px;"><small>If you have any questions about this study, please contact the research team through the platform.</small></p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ResearchHub. If you did not expect this invitation, please ignore this email.</p>
            <p>© 2025 ResearchHub - Advancing Research Through Technology</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password reset email template
  generatePasswordResetEmail(userName: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>ResearchHub Account Security</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your ResearchHub account.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>To reset your password, click the button below. This link will expire in 1 hour for security reasons.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p><strong>Security tips:</strong></p>
            <ul>
              <li>🔒 Choose a strong, unique password</li>
              <li>🔐 Enable two-factor authentication if available</li>
              <li>👀 Never share your password with anyone</li>
              <li>📱 Log out from shared devices</li>
            </ul>
            
            <p style="margin-top: 30px;"><small>If you continue to have problems, please contact our support team.</small></p>
          </div>
          <div class="footer">
            <p>This email was sent from ResearchHub security system.</p>
            <p>© 2025 ResearchHub - Secure Research Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email verification template
  generateVerificationEmail(userName: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
            <p>Welcome to ResearchHub</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for joining ResearchHub! To complete your account setup, please verify your email address.</p>
            
            <div class="success">
              <strong>🎉 Welcome aboard!</strong> You're just one click away from accessing our research platform.
            </div>
            
            <p>Click the button below to verify your email address and activate your account:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p><strong>What's next after verification:</strong></p>
            <ul>
              <li>🏠 Complete your profile setup</li>
              <li>🔍 Explore available research studies</li>
              <li>📊 Access your personal dashboard</li>
              <li>🤝 Connect with researchers</li>
            </ul>
            
            <p style="margin-top: 30px;"><small>If you did not create this account, please ignore this email.</small></p>
          </div>
          <div class="footer">
            <p>This verification email was sent by ResearchHub.</p>
            <p>© 2025 ResearchHub - Connecting Researchers and Participants</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendInvitationEmail(to: string, participantName: string, studyTitle: string, invitationLink: string): Promise<boolean> {
    const html = this.generateInvitationEmail(participantName, studyTitle, invitationLink);
    return this.sendEmail({
      to,
      subject: `📋 Study Invitation: ${studyTitle}`,
      html
    });
  }

  async sendPasswordResetEmail(to: string, userName: string, resetLink: string): Promise<boolean> {
    const html = this.generatePasswordResetEmail(userName, resetLink);
    return this.sendEmail({
      to,
      subject: '🔐 Reset Your ResearchHub Password',
      html
    });
  }

  async sendVerificationEmail(to: string, userName: string, verificationLink: string): Promise<boolean> {
    const html = this.generateVerificationEmail(userName, verificationLink);
    return this.sendEmail({
      to,
      subject: '✉️ Verify Your ResearchHub Account',
      html
    });
  }
}

export const emailService = new EmailService();
export default EmailService;
