"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const expense_schema_1 = require("../schemas/expense.schema");
const event_income_schema_1 = require("../schemas/event-income.schema");
const sale_schema_1 = require("../schemas/sale.schema");
const expenses_service_1 = require("./expenses.service");
const expenses_controller_1 = require("./expenses.controller");
const logs_module_1 = require("../logs/logs.module");
const product_schema_1 = require("../schemas/product.schema");
let ExpensesModule = class ExpensesModule {
};
exports.ExpensesModule = ExpensesModule;
exports.ExpensesModule = ExpensesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: expense_schema_1.Expense.name, schema: expense_schema_1.ExpenseSchema },
                { name: event_income_schema_1.EventIncome.name, schema: event_income_schema_1.EventIncomeSchema },
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
            ]),
            logs_module_1.LogsModule,
        ],
        controllers: [expenses_controller_1.ExpensesController],
        providers: [expenses_service_1.ExpensesService],
        exports: [expenses_service_1.ExpensesService],
    })
], ExpensesModule);
//# sourceMappingURL=expenses.module.js.map