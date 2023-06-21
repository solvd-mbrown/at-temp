import { Body, Controller, Get, Param } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get("report")
  async generateAndSendStoreReport(@Body("email") email: string) {
    return this.emailService.generateAndSendStoreReport(email);
  }

  @Get("reportByEmail/:email")
  async generateAndSendStoreReportByParam(@Param("email") email: string) {
    return this.emailService.generateAndSendStoreReport(email);
  }

  @Get("report/all")
  async generateAndSendStoreReportForAllUsers() {
    return this.emailService.generateAndSendStoreReportForAllUsers();
  }
}
