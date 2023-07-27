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

  public async generateAndSendStoreReport(email: string) {
    const users = await this.userRepository.getUsersWithStorageFileId();
    let user = [];
    for (let item of users) {
      if (item.email === email) {
        user.push(item);
      }
    }
    let report = {report : null};
    if (user.length) {
      report = await this.fileService.getUploadSizeByEmailReport(user);
    }
    return report;
  }

  public async generateAndSendStoreReportForAllUsers() {
    const users = await this.userRepository.getUsersWithStorageFileId();
    const report = await this.fileService.getUploadSizeByEmailReport(users);
    return report;
  }
}
