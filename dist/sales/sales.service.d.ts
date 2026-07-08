import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { ProductsService } from "../products/products.service";
import { LogsService } from "../logs/logs.service";
export declare class SalesService {
    private saleModel;
    private readonly productsService;
    private readonly logsService;
    constructor(saleModel: Model<Sale>, productsService: ProductsService, logsService: LogsService);
    findAll(): Promise<Sale[]>;
    findByCustomer(customerId: string): Promise<Sale[]>;
    create(createSaleDto: any): Promise<Sale>;
    updateStatus(id: string, status: string): Promise<Sale>;
    cancelSale(id: string, operatorId: string): Promise<Sale>;
}
