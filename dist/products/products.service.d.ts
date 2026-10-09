import { Model } from "mongoose";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { FirebaseService } from "../firebase/firebase.service";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { LogsService } from "../logs/logs.service";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { ImportPreviousStockDto } from "./dto/import-previous-stock.dto";
import { ExpensesService } from "../expenses/expenses.service";
export declare class ProductsService {
    private productModel;
    private categoryModel;
    private firebaseService;
    private wsGateway;
    private logsService;
    private expensesService;
    private readonly logger;
    constructor(productModel: Model<Product>, categoryModel: Model<Category>, firebaseService: FirebaseService, wsGateway: WebsocketGateway, logsService: LogsService, expensesService: ExpensesService);
    private getOrCreateCategory;
    findAll(includeInactive?: boolean, eventId?: string): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<Product>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    updateStock(id: string, newStock: number): Promise<Product>;
    incrementStock(id: string, delta: number): Promise<Product>;
    deactivate(id: string): Promise<Product>;
    activate(id: string): Promise<Product>;
    getRemainingStockFromEvent(eventId: string): Promise<Product[]>;
    importStockReconciliation(dto: ImportPreviousStockDto): Promise<{
        importedCount: number;
        writtenOffCount: number;
        createdProducts: Product[];
    }>;
}
