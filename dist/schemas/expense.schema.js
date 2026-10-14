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
exports.ExpenseSchema = exports.Expense = exports.ExpenseItemSchema = exports.ExpenseItem = exports.RepaymentRecordSchema = exports.RepaymentRecord = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let RepaymentRecord = class RepaymentRecord {
    _id;
    amount;
    date;
    method;
    proofUrl;
    operatorName;
    notes;
};
exports.RepaymentRecord = RepaymentRecord;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, default: () => new mongoose_2.Types.ObjectId() }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RepaymentRecord.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], RepaymentRecord.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], RepaymentRecord.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: "PIX" }),
    __metadata("design:type", String)
], RepaymentRecord.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], RepaymentRecord.prototype, "proofUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "Admin" }),
    __metadata("design:type", String)
], RepaymentRecord.prototype, "operatorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], RepaymentRecord.prototype, "notes", void 0);
exports.RepaymentRecord = RepaymentRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RepaymentRecord);
exports.RepaymentRecordSchema = mongoose_1.SchemaFactory.createForClass(RepaymentRecord);
let ExpenseItem = class ExpenseItem {
    _id;
    description;
    amount;
    paidBy;
    payerPhone;
    isDonation;
    status;
    repaidAmount;
    receiptUrl;
    notes;
    date;
    repaymentHistory;
};
exports.ExpenseItem = ExpenseItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, default: () => new mongoose_2.Types.ObjectId() }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExpenseItem.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], ExpenseItem.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "paidBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "payerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ExpenseItem.prototype, "isDonation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ["PENDENTE", "REEMBOLSADO_PARCIAL", "REEMBOLSADO", "DOACAO"],
        default: "PENDENTE",
    }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, type: Number }),
    __metadata("design:type", Number)
], ExpenseItem.prototype, "repaidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "receiptUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], ExpenseItem.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], ExpenseItem.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.RepaymentRecordSchema], default: [] }),
    __metadata("design:type", Array)
], ExpenseItem.prototype, "repaymentHistory", void 0);
exports.ExpenseItem = ExpenseItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExpenseItem);
exports.ExpenseItemSchema = mongoose_1.SchemaFactory.createForClass(ExpenseItem);
let Expense = class Expense extends mongoose_2.Document {
    eventId;
    title;
    category;
    nature;
    description;
    items;
    totalAmount;
    totalRepaid;
    synced;
};
exports.Expense = Expense;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "Event", index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Expense.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Expense.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: "OBRA" }),
    __metadata("design:type", String)
], Expense.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ["INFRAESTRUTURA", "OPERACIONAL", "LOJINHA_INVESTIMENTO", "LOJINHA_DOACAO"],
        default: "INFRAESTRUTURA",
    }),
    __metadata("design:type", String)
], Expense.prototype, "nature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ExpenseItemSchema], default: [] }),
    __metadata("design:type", Array)
], Expense.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, type: Number }),
    __metadata("design:type", Number)
], Expense.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, type: Number }),
    __metadata("design:type", Number)
], Expense.prototype, "totalRepaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Expense.prototype, "synced", void 0);
exports.Expense = Expense = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Expense);
exports.ExpenseSchema = mongoose_1.SchemaFactory.createForClass(Expense);
exports.ExpenseSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.ExpenseSchema.set("toJSON", { virtuals: true });
exports.ExpenseSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=expense.schema.js.map