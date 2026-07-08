import { Model } from "mongoose";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { FirebaseService } from "../firebase/firebase.service";
import { WebsocketGateway } from "../websocket/websocket.gateway";
export declare class ProductsService {
    private productModel;
    private categoryModel;
    private firebaseService;
    private wsGateway;
    constructor(productModel: Model<Product>, categoryModel: Model<Category>, firebaseService: FirebaseService, wsGateway: WebsocketGateway);
    private getOrCreateCategory;
    findAll(includeInactive?: boolean): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    create(createProductDto: any, file?: Express.Multer.File): Promise<Product>;
    update(id: string, updateProductDto: any, file?: Express.Multer.File): Promise<Product>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    updateStock(id: string, newStock: number): Promise<Product>;
    deactivate(id: string): Promise<Product>;
    activate(id: string): Promise<Product>;
}
