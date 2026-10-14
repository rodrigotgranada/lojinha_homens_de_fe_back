import { Model } from "mongoose";
import { SyncService } from "./sync.service";
import { Sale } from "../schemas/sale.schema";
import { User } from "../schemas/user.schema";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { Event } from "../schemas/event.schema";
export declare class SyncController {
    private readonly syncService;
    private readonly saleModel;
    private readonly userModel;
    private readonly productModel;
    private readonly categoryModel;
    private readonly eventModel;
    private readonly logger;
    constructor(syncService: SyncService, saleModel: Model<Sale>, userModel: Model<User>, productModel: Model<Product>, categoryModel: Model<Category>, eventModel: Model<Event>);
    healthCheck(): {
        status: string;
        timestamp: number;
    };
    triggerSync(): Promise<{
        status: string;
    }>;
    pushData(payload: {
        sales: any[];
        users: any[];
    }): Promise<{
        success: boolean;
        errors: string[];
    } | {
        success: boolean;
        errors?: undefined;
    }>;
    pullData(lastSyncDate: string): Promise<{
        categories: (import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        events: (import("mongoose").Document<unknown, {}, Event, {}, import("mongoose").DefaultSchemaOptions> & Event & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        products: (import("mongoose").Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        users: (import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        sales: (import("mongoose").Document<unknown, {}, Sale, {}, import("mongoose").DefaultSchemaOptions> & Sale & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        timestamp: number;
    }>;
}
