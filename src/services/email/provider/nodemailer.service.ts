import * as nodemailer from "nodemailer";
import { Inject, Injectable } from "@nestjs/common";
import { IEmailProvider, ISendEmailParams } from "../email.interface";
import Mail from "nodemailer/lib/mailer";
import { ConfigType } from "@nestjs/config";
import configuration from "src/services/config/env.config";

@Injectable()
export class NodemailerService implements IEmailProvider {
  constructor(
    @Inject(configuration.KEY)
    private readonly envConfig: ConfigType<typeof configuration>
  ) {}

  public async sendEmail({
    emails,
    attachments,
    subject,
    text,
  }: ISendEmailParams): Promise<string> {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.envConfig.email.address,
        pass: this.envConfig.email.password,
      },
    });

    let mailOptions: Mail.Options = {
      from: this.envConfig.email.address,
      to: emails.join(", "),
      subject: subject || `Upload size report for ${new Date().toDateString()}`,
      text: text || "Report attached",
    };

    if (attachments?.length > 0) {
      mailOptions = {
        ...mailOptions,
        attachments: attachments.map((attachement, idx) => ({
          filename: `${new Date().toDateString()}__report${idx}.csv`,
          content: attachement,
        })),
      };
    }

    return new Promise((res, rej) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          rej(error);
        } else {
          res("Email sent: " + info.response);
        }
      });
    });
  }
}
