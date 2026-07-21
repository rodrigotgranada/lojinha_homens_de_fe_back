import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SyncService } from "./sync.service";
import { SyncController } from "./sync.controller";
import { Sale, SaleSchema } from "../schemas/sale.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { Product, ProductSchema } from "../schemas/product.schema";
import { Category, CategorySchema } from "../schemas/category.schema";
import { Event, EventSchema } from "../schemas/event.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
