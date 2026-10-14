"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockEntriesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const stock_entries_controller_1 = require("./stock-entries.controller");
const stock_entries_service_1 = require("./stock-entries.service");
const stock_entry_schema_1 = require("../schemas/stock-entry.schema");
const product_schema_1 = require("../schemas/product.schema");
const event_stock_schema_1 = require("../schemas/event-stock.schema");
const websocket_module_1 = require("../websocket/websocket.module");
const logs_module_1 = require("../logs/logs.module");
const expenses_module_1 = require("../expenses/expenses.module");
let StockEntriesModule = class StockEntriesModule {
};
exports.StockEntriesModule = StockEntriesModule;
exports.StockEntriesModule = StockEntriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: stock_entry_schema_1.StockEntry.name, schema: stock_entry_schema_1.StockEntrySchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: event_stock_schema_1.EventStock.name, schema: event_stock_schema_1.EventStockSchema },
            ]),
            websocket_module_1.WebsocketModule,
            logs_module_1.LogsModule,
            expenses_module_1.ExpensesModule,
        ],
        controllers: [stock_entries_controller_1.StockEntriesController],
        providers: [stock_entries_service_1.StockEntriesService],
        exports: [stock_entries_service_1.StockEntriesService, mongoose_1.MongooseModule],
    })
], StockEntriesModule);
//# sourceMappingURL=stock-entries.module.js.map