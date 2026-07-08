import { LogsService } from "./logs.service";
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    create(createLogDto: any): Promise<import("../schemas/log.schema").Log>;
    findAll(productId?: string): Promise<import("../schemas/log.schema").Log[]>;
}
