import { StockEntriesService } from "./stock-entries.service";
import { CreateStockEntryDto } from "./dto/stock-entry.dto";
export declare class StockEntriesController {
    private readonly stockEntriesService;
    constructor(stockEntriesService: StockEntriesService);
    findAll(productId?: string, eventId?: string): Promise<import("../schemas/stock-entry.schema").StockEntry[]>;
    findByProduct(productId: string): Promise<import("../schemas/stock-entry.schema").StockEntry[]>;
    findByEvent(eventId: string): Promise<import("../schemas/stock-entry.schema").StockEntry[]>;
    findOne(id: string): Promise<import("../schemas/stock-entry.schema").StockEntry>;
    create(createDto: CreateStockEntryDto): Promise<import("../schemas/stock-entry.schema").StockEntry>;
    delete(id: string, operatorName?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
