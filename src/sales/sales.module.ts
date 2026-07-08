import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { Sale, SaleSchema } from "../schemas/sale.schema";

import { ProductsModule } from "../products/products.module";
import { LogsModule } from "../logs/logs.module";
import { SalesAnalyticsService } from "./sales-analytics.service";
import { SalesAnalyticsController } from "./sales-analytics.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    ProductsModule,
    LogsModule,
  ],
  controllers: [SalesController, SalesAnalyticsController],
  providers: [SalesService, SalesAnalyticsService],
  exports: [SalesService, SalesAnalyticsService],
})
export class SalesModule {}
