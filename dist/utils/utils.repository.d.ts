import { ConfigService } from '@nestjs/config';
export declare class UtilsRepository {
    private readonly configService;
    constructor(configService: ConfigService);
    static getStringVersion(param: any): string;
}
