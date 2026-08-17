import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Expense, ExpenseSchema } from "../schemas/expense.schema";
import { EventIncome, EventIncomeSchema } from "../schemas/event-income.schema";
import { Sale, SaleSchema } from "../schemas/sale.schema";
import { ExpensesService } from "./expenses.service";
import { ExpensesController } from "./expenses.controller";
import { LogsModule } from "../logs/logs.module";

import { Product, ProductSchema } from "../schemas/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: EventIncome.name, schema: EventIncomeSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    LogsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
