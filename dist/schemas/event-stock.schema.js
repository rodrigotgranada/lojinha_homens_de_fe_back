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
exports.EventStockSchema = exports.EventStock = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EventStock = class EventStock extends mongoose_2.Document {
    eventId;
    productId;
    stock;
    initialStock;
    minStock;
    price;
    totalCost;
    sponsorName;
    sponsorCpf;
    sponsorPhone;
    isDonation;
};
exports.EventStock = EventStock;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Event", required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EventStock.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Product", required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EventStock.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], EventStock.prototype, "stock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], EventStock.prototype, "initialStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 5, type: Number }),
    __metadata("design:type", Number)
], EventStock.prototype, "minStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], EventStock.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, type: Number }),
    __metadata("design:type", Number)
], EventStock.prototype, "totalCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], EventStock.prototype, "sponsorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], EventStock.prototype, "sponsorCpf", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], EventStock.prototype, "sponsorPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EventStock.prototype, "isDonation", void 0);
exports.EventStock = EventStock = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EventStock);
exports.EventStockSchema = mongoose_1.SchemaFactory.createForClass(EventStock);
exports.EventStockSchema.index({ eventId: 1, productId: 1 }, { unique: true });
exports.EventStockSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.EventStockSchema.set("toJSON", { virtuals: true });
exports.EventStockSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=event-stock.schema.js.map