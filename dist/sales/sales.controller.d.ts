import { SalesService } from "./sales.service";
import { CreateSaleDto, CancelSaleDto, UpdateSaleStatusDto } from "./dto/sale.dto";
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(customerId?: string): Promise<import("../schemas/sale.schema").Sale[]>;
    create(createSaleDto: CreateSaleDto): Promise<import("../schemas/sale.schema").Sale>;
    updateStatus(id: string, body: UpdateSaleStatusDto): Promise<import("../schemas/sale.schema").Sale>;
    cancelSale(id: string, body: CancelSaleDto): Promise<import("../schemas/sale.schema").Sale>;
}
