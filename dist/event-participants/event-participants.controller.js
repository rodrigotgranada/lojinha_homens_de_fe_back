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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParticipantsController = void 0;
const common_1 = require("@nestjs/common");
const event_participants_service_1 = require("./event-participants.service");
const event_participant_dto_1 = require("./dto/event-participant.dto");
let EventParticipantsController = class EventParticipantsController {
    participantsService;
    constructor(participantsService) {
        this.participantsService = participantsService;
    }
    async findByEvent(eventId, status) {
        return this.participantsService.findByEvent(eventId, status);
    }
    async findUsersByEvent(eventId) {
        return this.participantsService.findUsersByEvent(eventId);
    }
    async addParticipant(eventId, dto, operator) {
        return this.participantsService.addParticipant(eventId, dto, operator || "Admin");
    }
    async updateParticipant(id, dto) {
        return this.participantsService.updateParticipant(id, dto);
    }
    async removeParticipant(id) {
        return this.participantsService.removeParticipant(id);
    }
};
exports.EventParticipantsController = EventParticipantsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)("eventId")),
    __param(1, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)("users"),
    __param(0, (0, common_1.Param)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "findUsersByEvent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)("eventId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("operator")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_participant_dto_1.CreateEventParticipantDto, String]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_participant_dto_1.UpdateEventParticipantDto]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "updateParticipant", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "removeParticipant", null);
exports.EventParticipantsController = EventParticipantsController = __decorate([
    (0, common_1.Controller)("events/:eventId/participants"),
    __metadata("design:paramtypes", [event_participants_service_1.EventParticipantsService])
], EventParticipantsController);
//# sourceMappingURL=event-participants.controller.js.map