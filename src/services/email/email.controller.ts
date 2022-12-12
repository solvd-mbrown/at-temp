import { Body, Controller, Get } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get("report")
  async generateAndSendStoreReport(@Body("emails") emails: string[]) {
    return this.emailService.generateAndSendStoreReport(emails);
  }
}
