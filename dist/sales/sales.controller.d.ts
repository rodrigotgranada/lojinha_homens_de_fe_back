import { SalesService } from "./sales.service";
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(customerId?: string): Promise<import("../schemas/sale.schema").Sale[]>;
    create(createSaleDto: any): Promise<import("../schemas/sale.schema").Sale>;
    updateStatus(id: string, body: any): Promise<import("../schemas/sale.schema").Sale>;
    cancelSale(id: string, operatorId: string): Promise<import("../schemas/sale.schema").Sale>;
}
