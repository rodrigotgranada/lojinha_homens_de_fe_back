import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StockEntriesController } from "./stock-entries.controller";
import { StockEntriesService } from "./stock-entries.service";
import { StockEntry, StockEntrySchema } from "../schemas/stock-entry.schema";
import { Product, ProductSchema } from "../schemas/product.schema";
import { WebsocketModule } from "../websocket/websocket.module";
import { LogsModule } from "../logs/logs.module";
import { ExpensesModule } from "../expenses/expenses.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockEntry.name, schema: StockEntrySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    WebsocketModule,
    LogsModule,
    ExpensesModule,
  ],
  controllers: [StockEntriesController],
  providers: [StockEntriesService],
  exports: [StockEntriesService, MongooseModule],
})
export class StockEntriesModule {}
