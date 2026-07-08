import { Model } from "mongoose";
import { Log } from "../schemas/log.schema";
import { WebsocketGateway } from "../websocket/websocket.gateway";
export declare class LogsService {
    private logModel;
    private wsGateway;
    constructor(logModel: Model<Log>, wsGateway: WebsocketGateway);
    create(createLogDto: any): Promise<Log>;
    findAll(productId?: string): Promise<Log[]>;
}
