import { OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { User } from "../schemas/user.schema";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { Event } from "../schemas/event.schema";
export declare class SyncService implements OnApplicationBootstrap {
    private readonly configService;
    private readonly saleModel;
    private readonly userModel;
    private readonly productModel;
    private readonly categoryModel;
    private readonly eventModel;
    private readonly logger;
    private isSyncing;
    private lastPullTimestamp;
    constructor(configService: ConfigService, saleModel: Model<Sale>, userModel: Model<User>, productModel: Model<Product>, categoryModel: Model<Category>, eventModel: Model<Event>);
    onApplicationBootstrap(): void;
    runSyncCycle(): Promise<void>;
    private checkRemoteConnectivity;
    private pushLocalDataToRemote;
    private pullRemoteDataToLocal;
}
