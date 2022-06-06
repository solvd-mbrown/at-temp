import { Driver } from 'neo4j-driver/types/driver';
export declare class Migrate {
    private driver;
    constructor(driver: Driver);
    close(): Promise<boolean>;
    destroy(): void;
}
