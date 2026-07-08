import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log } from "../schemas/log.schema";
import { WebsocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<Log>,
    private wsGateway: WebsocketGateway
  ) {}

  async create(createLogDto: any): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    const savedLog = await createdLog.save();
    
    // Broadcast log added via WebSocket gateway
    this.wsGateway.broadcastLogAdded(savedLog);
    
    return savedLog;
  }

  async findAll(productId?: string): Promise<Log[]> {
    const filter = productId ? { "metadata.productId": productId } : {};
    return this.logModel.find(filter).sort({ createdAt: -1 }).exec();
  }
}
