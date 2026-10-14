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
exports.UpdateEventParticipantDto = exports.CreateEventParticipantDto = void 0;
const class_validator_1 = require("class-validator");
class CreateEventParticipantDto {
    userId;
    type;
    status;
    notes;
}
exports.CreateEventParticipantDto = CreateEventParticipantDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventParticipantDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(["ACAMPANTE", "TRABALHO"]),
    __metadata("design:type", String)
], CreateEventParticipantDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(["CONFIRMADO", "PENDENTE", "CANCELADO"]),
    __metadata("design:type", String)
], CreateEventParticipantDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventParticipantDto.prototype, "notes", void 0);
class UpdateEventParticipantDto {
    type;
    status;
    notes;
}
exports.UpdateEventParticipantDto = UpdateEventParticipantDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(["ACAMPANTE", "TRABALHO"]),
    __metadata("design:type", String)
], UpdateEventParticipantDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(["CONFIRMADO", "PENDENTE", "CANCELADO"]),
    __metadata("design:type", String)
], UpdateEventParticipantDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEventParticipantDto.prototype, "notes", void 0);
//# sourceMappingURL=event-participant.dto.js.map