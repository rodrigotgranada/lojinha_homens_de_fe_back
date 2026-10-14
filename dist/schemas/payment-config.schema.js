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
exports.PaymentConfigSchema = exports.PaymentConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PaymentConfig = class PaymentConfig extends mongoose_2.Document {
    pixKey;
    keyType;
    merchantName;
    bankName;
    city;
    description;
    isDefault;
    active;
};
exports.PaymentConfig = PaymentConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "pixKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "EMAIL" }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "keyType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "merchantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PaymentConfig.prototype, "isDefault", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PaymentConfig.prototype, "active", void 0);
exports.PaymentConfig = PaymentConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PaymentConfig);
exports.PaymentConfigSchema = mongoose_1.SchemaFactory.createForClass(PaymentConfig);
exports.PaymentConfigSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.PaymentConfigSchema.set("toJSON", { virtuals: true });
exports.PaymentConfigSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=payment-config.schema.js.map