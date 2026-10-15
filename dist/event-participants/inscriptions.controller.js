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
exports.InscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const event_participants_service_1 = require("./event-participants.service");
const public_inscription_dto_1 = require("./dto/public-inscription.dto");
let InscriptionsController = class InscriptionsController {
    participantsService;
    constructor(participantsService) {
        this.participantsService = participantsService;
    }
    async getActiveEvent() {
        const event = await this.participantsService.getActiveEvent();
        if (!event) {
            return null;
        }
        return {
            id: event._id.toString(),
            name: event.name,
            slug: event.slug,
            city: event.city,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status,
            isActive: event.isActive,
        };
    }
    async getEventBySlug(slug) {
        const event = await this.participantsService.getEventBySlug(slug);
        if (!event) {
            return null;
        }
        return {
            id: event._id.toString(),
            name: event.name,
            slug: event.slug,
            city: event.city,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status,
            isActive: event.isActive,
        };
    }
    async submitPublicInscription(dto) {
        return this.participantsService.submitPublicInscription(dto);
    }
    async findAllInscriptions(eventId, status, type, search) {
        return this.participantsService.findAllInscriptions({
            eventId,
            status,
            type,
            search,
        });
    }
    async confirmParticipant(id, operator) {
        return this.participantsService.confirmParticipant(id, operator || "Admin");
    }
    async cancelParticipant(id, operator) {
        return this.participantsService.cancelParticipant(id, operator || "Admin");
    }
    async updateParticipantType(id, type) {
        return this.participantsService.updateParticipant(id, { type });
    }
};
exports.InscriptionsController = InscriptionsController;
__decorate([
    (0, common_1.Get)("active-event"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "getActiveEvent", null);
__decorate([
    (0, common_1.Get)("event-by-slug/:slug"),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "getEventBySlug", null);
__decorate([
    (0, common_1.Post)("public"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_inscription_dto_1.PublicInscriptionDto]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "submitPublicInscription", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("eventId")),
    __param(1, (0, common_1.Query)("status")),
    __param(2, (0, common_1.Query)("type")),
    __param(3, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "findAllInscriptions", null);
__decorate([
    (0, common_1.Patch)(":id/confirm"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("operator")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "confirmParticipant", null);
__decorate([
    (0, common_1.Patch)(":id/cancel"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("operator")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "cancelParticipant", null);
__decorate([
    (0, common_1.Patch)(":id/type"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InscriptionsController.prototype, "updateParticipantType", null);
exports.InscriptionsController = InscriptionsController = __decorate([
    (0, common_1.Controller)("inscriptions"),
    __metadata("design:paramtypes", [event_participants_service_1.EventParticipantsService])
], InscriptionsController);
//# sourceMappingURL=inscriptions.controller.js.map