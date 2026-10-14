import { Model } from "mongoose";
import { StockEntry } from "../schemas/stock-entry.schema";
import { Product } from "../schemas/product.schema";
import { EventStock } from "../schemas/event-stock.schema";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { LogsService } from "../logs/logs.service";
import { ExpensesService } from "../expenses/expenses.service";
import { CreateStockEntryDto } from "./dto/stock-entry.dto";
export declare class StockEntriesService {
    private readonly stockEntryModel;
    private readonly productModel;
    private readonly eventStockModel;
    private readonly wsGateway;
    private readonly logsService;
    private readonly expensesService;
    private readonly logger;
    constructor(stockEntryModel: Model<StockEntry>, productModel: Model<Product>, eventStockModel: Model<EventStock>, wsGateway: WebsocketGateway, logsService: LogsService, expensesService: ExpensesService);
    create(dto: CreateStockEntryDto): Promise<StockEntry>;
    findByProduct(productId: string): Promise<StockEntry[]>;
    findByEvent(eventId: string): Promise<StockEntry[]>;
    findAll(productId?: string, eventId?: string): Promise<StockEntry[]>;
    findOne(id: string): Promise<StockEntry>;
    delete(id: string, operatorName?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
