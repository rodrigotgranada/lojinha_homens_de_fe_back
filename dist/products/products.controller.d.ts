import { ProductsService } from "./products.service";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(includeAll?: string): Promise<import("../schemas/product.schema").Product[]>;
    findOne(id: string): Promise<import("../schemas/product.schema").Product>;
    create(createProductDto: any, file?: Express.Multer.File): Promise<import("../schemas/product.schema").Product>;
    update(id: string, updateProductDto: any, file?: Express.Multer.File): Promise<import("../schemas/product.schema").Product>;
    patchUpdate(id: string, body: any): Promise<import("../schemas/product.schema").Product>;
    deactivate(id: string): Promise<import("../schemas/product.schema").Product>;
    activate(id: string): Promise<import("../schemas/product.schema").Product>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
