import { Inject, Injectable } from "@nestjs/common";
import { FileService } from "src/domain/file/file.service";
import { UserRepository } from "src/domain/user/user.repository";
import { EmailProvider, IEmailProvider } from "./email.interface";

@Injectable()
export class EmailService {
  constructor(
    private readonly fileService: FileService,
    @Inject(EmailProvider) private readonly emailProvider: IEmailProvider,
    private readonly userRepository: UserRepository
  ) {}

  public async generateAndSendStoreReport(emails: string[]) {
    const users = await this.userRepository.getUsersWithStorageFileId();
    setTimeout(async () => {
      const report = await this.fileService.getUploadSizeByEmailReport(users);
      await this.emailProvider.sendEmail({
        emails,
        attachments: [report],
      });
    }, 0);
    return { status: "report request received" };
  }
}
