"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleSchema = exports.Sale = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SaleItem = class SaleItem {
    productId;
    quantity;
    priceAtPurchase;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "Product" }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SaleItem.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], SaleItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], SaleItem.prototype, "priceAtPurchase", void 0);
SaleItem = __decorate([
    (0, mongoose_1.Schema)()
], SaleItem);
const SaleItemSchema = mongoose_1.SchemaFactory.createForClass(SaleItem);
let Sale = class Sale extends mongoose_2.Document {
    customerId;
    eventId;
    items;
    totalPrice;
    status;
};
exports.Sale = Sale;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "User", index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Sale.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "Event", index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Sale.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SaleItemSchema], required: true }),
    __metadata("design:type", Array)
], Sale.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Sale.prototype, "totalPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ["PAGO", "PENDENTE", "CANCELADO"], default: "PAGO", index: true }),
    __metadata("design:type", String)
], Sale.prototype, "status", void 0);
exports.Sale = Sale = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Sale);
exports.SaleSchema = mongoose_1.SchemaFactory.createForClass(Sale);
exports.SaleSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
exports.SaleSchema.set("toJSON", { virtuals: true });
exports.SaleSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=sale.schema.js.map