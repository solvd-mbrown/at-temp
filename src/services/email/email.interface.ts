export interface IEmailProvider {
  sendEmail(params: ISendEmailParams): Promise<string>;
}

export interface ISendEmailParams {
  emails: string[];
  subject?: string;
  text?: string;
  attachments?: string[];
}

export const EmailProvider = "EmailProvider";
