import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from "./dto/product.dto";
import { ImportPreviousStockDto } from "./dto/import-previous-stock.dto";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(includeAll?: string, eventId?: string): Promise<import("../schemas/product.schema").Product[]>;
    getRemainingStock(eventId: string): Promise<import("../schemas/product.schema").Product[]>;
    importStockReconciliation(dto: ImportPreviousStockDto): Promise<{
        importedCount: number;
        writtenOffCount: number;
        createdProducts: import("../schemas/product.schema").Product[];
    }>;
    findOne(id: string): Promise<import("../schemas/product.schema").Product>;
    create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<import("../schemas/product.schema").Product>;
    update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<import("../schemas/product.schema").Product>;
    patchUpdate(id: string, body: UpdateStockDto | UpdateProductDto): Promise<import("../schemas/product.schema").Product>;
    deactivate(id: string): Promise<import("../schemas/product.schema").Product>;
    activate(id: string): Promise<import("../schemas/product.schema").Product>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
