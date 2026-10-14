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
exports.EventParticipantSchema = exports.EventParticipant = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EventParticipant = class EventParticipant extends mongoose_2.Document {
    eventId;
    userId;
    type;
    status;
    submittedAt;
    weight;
    height;
    referralSource;
    healthRestrictions;
    lgpdAuthorized;
    preferredRoles;
    willGiveTestimony;
    testimonyDetails;
    testimonyReason;
    previousHfEdition;
    availabilityDays;
    hasTent;
    preCampAvailability;
    pastRoles;
    estimatedGuestsCount;
    notes;
    confirmedAt;
    confirmedBy;
};
exports.EventParticipant = EventParticipant;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Event", required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EventParticipant.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "User", required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EventParticipant.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ["ACAMPANTE", "TRABALHO"], default: "ACAMPANTE" }),
    __metadata("design:type", String)
], EventParticipant.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ["CONFIRMADO", "PENDENTE", "CANCELADO"], default: "PENDENTE" }),
    __metadata("design:type", String)
], EventParticipant.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], EventParticipant.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EventParticipant.prototype, "weight", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EventParticipant.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "referralSource", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "healthRestrictions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EventParticipant.prototype, "lgpdAuthorized", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EventParticipant.prototype, "preferredRoles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EventParticipant.prototype, "willGiveTestimony", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "testimonyDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "testimonyReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "previousHfEdition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EventParticipant.prototype, "availabilityDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EventParticipant.prototype, "hasTent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EventParticipant.prototype, "preCampAvailability", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "pastRoles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], EventParticipant.prototype, "estimatedGuestsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], EventParticipant.prototype, "confirmedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventParticipant.prototype, "confirmedBy", void 0);
exports.EventParticipant = EventParticipant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EventParticipant);
exports.EventParticipantSchema = mongoose_1.SchemaFactory.createForClass(EventParticipant);
exports.EventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });
exports.EventParticipantSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});
exports.EventParticipantSchema.set("toJSON", { virtuals: true });
exports.EventParticipantSchema.set("toObject", { virtuals: true });
//# sourceMappingURL=event-participant.schema.js.map