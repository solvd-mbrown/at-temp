import { Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable({ scope: Scope.REQUEST })
export class UtilsRepository {
  constructor(private readonly configService: ConfigService) {}

  static getStringVersion(param): string {
    return typeof param === "string" ? param : JSON.stringify(param);
  }
}
