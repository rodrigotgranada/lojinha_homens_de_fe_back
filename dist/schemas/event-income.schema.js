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
exports.EventIncomeSchema = exports.EventIncome = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EventIncome = class EventIncome extends mongoose_2.Document {
    eventId;
    title;
    type;
    amount;
    date;
    notes;
    synced;
};
exports.EventIncome = EventIncome;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: "Event", index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EventIncome.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventIncome.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: String,
        default: "INSCRICOES",
    }),
    __metadata("design:type", String)
], EventIncome.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], EventIncome.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], EventIncome.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], EventIncome.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], EventIncome.prototype, "synced", void 0);
exports.EventIncome = EventIncome = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EventIncome);
exports.EventIncomeSchema = mongoose_1.SchemaFactory.createForClass(EventIncome);
exports.EventIncomeSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.EventIncomeSchema.set("toJSON", { virtuals: true });
exports.EventIncomeSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=event-income.schema.js.map