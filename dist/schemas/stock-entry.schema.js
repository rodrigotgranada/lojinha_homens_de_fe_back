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
exports.StockEntrySchema = exports.StockEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let StockEntry = class StockEntry extends mongoose_2.Document {
    productId;
    eventId;
    quantity;
    costPrice;
    totalCost;
    sponsorName;
    sponsorCpf;
    sponsorPhone;
    sponsorUserId;
    isDonation;
    date;
    notes;
    createdBy;
    operatorName;
    expenseGroupId;
    expenseItemId;
};
exports.StockEntry = StockEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "Product", index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Event", index: true, required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, min: 1 }),
    __metadata("design:type", Number)
], StockEntry.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], StockEntry.prototype, "costPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], StockEntry.prototype, "totalCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], StockEntry.prototype, "sponsorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], StockEntry.prototype, "sponsorCpf", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], StockEntry.prototype, "sponsorPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "User", required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "sponsorUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, type: Boolean }),
    __metadata("design:type", Boolean)
], StockEntry.prototype, "isDonation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now, type: Date }),
    __metadata("design:type", Date)
], StockEntry.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], StockEntry.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "User", required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "Sistema" }),
    __metadata("design:type", String)
], StockEntry.prototype, "operatorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "expenseGroupId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockEntry.prototype, "expenseItemId", void 0);
exports.StockEntry = StockEntry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], StockEntry);
exports.StockEntrySchema = mongoose_1.SchemaFactory.createForClass(StockEntry);
exports.StockEntrySchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.StockEntrySchema.set("toJSON", { virtuals: true });
exports.StockEntrySchema.set("toObject", { virtuals: true });
//# sourceMappingURL=stock-entry.schema.js.map