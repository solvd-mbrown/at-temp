import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { Module } from "@nestjs/common";
import { EmailProvider } from "./email.interface";
import { NodemailerService } from "./provider/nodemailer.service";

@Module({
  imports: [],
  controllers: [EmailController],
  providers: [
    EmailService,
    {
      provide: EmailProvider,
      useClass: NodemailerService,
    },
  ],
})
export class EmailModule {}
