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
exports.PublicInscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PublicInscriptionDto {
    eventId;
    eventSlug;
    cpf;
    firstName;
    lastName;
    phone;
    email;
    city;
    birthDate;
    parish;
    type;
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
}
exports.PublicInscriptionDto = PublicInscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "eventSlug", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: "CPF é obrigatório" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: "Nome é obrigatório" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: "Sobrenome é obrigatório" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: "Telefone/WhatsApp é obrigatório" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "parish", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: "Tipo de inscrição é obrigatório" }),
    (0, class_validator_1.IsEnum)(["ACAMPANTE", "TRABALHO"]),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PublicInscriptionDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PublicInscriptionDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "referralSource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "healthRestrictions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PublicInscriptionDto.prototype, "lgpdAuthorized", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PublicInscriptionDto.prototype, "preferredRoles", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PublicInscriptionDto.prototype, "willGiveTestimony", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "testimonyDetails", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "testimonyReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "previousHfEdition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PublicInscriptionDto.prototype, "availabilityDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PublicInscriptionDto.prototype, "hasTent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PublicInscriptionDto.prototype, "preCampAvailability", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicInscriptionDto.prototype, "pastRoles", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PublicInscriptionDto.prototype, "estimatedGuestsCount", void 0);
//# sourceMappingURL=public-inscription.dto.js.map