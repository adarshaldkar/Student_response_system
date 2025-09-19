// Fallback type declarations for nodemailer
// This provides basic type support if @types/nodemailer is not available

declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export interface MailOptions {
    from?: string | { name: string; address: string };
    to?: string;
    subject?: string;
    html?: string;
    text?: string;
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<any>;
    verify(): Promise<boolean>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}
