"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const sync_service_1 = require("./sync.service");
const sync_controller_1 = require("./sync.controller");
const sale_schema_1 = require("../schemas/sale.schema");
const user_schema_1 = require("../schemas/user.schema");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const event_schema_1 = require("../schemas/event.schema");
let SyncModule = class SyncModule {
};
exports.SyncModule = SyncModule;
exports.SyncModule = SyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: event_schema_1.Event.name, schema: event_schema_1.EventSchema },
            ]),
        ],
        controllers: [sync_controller_1.SyncController],
        providers: [sync_service_1.SyncService],
        exports: [sync_service_1.SyncService],
    })
], SyncModule);
//# sourceMappingURL=sync.module.js.map