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
exports.EventParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_participant_schema_1 = require("../schemas/event-participant.schema");
const user_schema_1 = require("../schemas/user.schema");
const event_schema_1 = require("../schemas/event.schema");
let EventParticipantsService = class EventParticipantsService {
    participantModel;
    userModel;
    eventModel;
    constructor(participantModel, userModel, eventModel) {
        this.participantModel = participantModel;
        this.userModel = userModel;
        this.eventModel = eventModel;
    }
    async findByEvent(eventId, status) {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("ID de evento inválido");
        }
        const filter = { eventId: new mongoose_2.Types.ObjectId(eventId) };
        if (status) {
            filter.status = status;
        }
        return this.participantModel
            .find(filter)
            .populate("userId")
            .sort({ createdAt: -1 })
            .exec();
    }
    async findUsersByEvent(eventId) {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("ID de evento inválido");
        }
        const participants = await this.participantModel
            .find({
            eventId: new mongoose_2.Types.ObjectId(eventId),
            status: "CONFIRMADO",
        })
            .populate("userId")
            .exec();
        return participants
            .filter((p) => p.userId != null)
            .map((p) => {
            const userObj = typeof p.userId.toObject === "function"
                ? p.userId.toObject()
                : p.userId;
            return {
                ...userObj,
                id: userObj._id ? userObj._id.toString() : userObj.id,
                eventParticipantId: p._id.toString(),
                participantType: p.type,
                participantStatus: p.status,
                participantNotes: p.notes,
            };
        });
    }
    async addParticipant(eventId, dto, operatorName = "Admin") {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("ID de evento inválido");
        }
        if (!mongoose_2.Types.ObjectId.isValid(dto.userId)) {
            throw new common_1.BadRequestException("ID de usuário inválido");
        }
        const eventObjId = new mongoose_2.Types.ObjectId(eventId);
        const userObjId = new mongoose_2.Types.ObjectId(dto.userId);
        const user = await this.userModel.findById(userObjId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Usuário não encontrado com ID ${dto.userId}`);
        }
        const existing = await this.participantModel
            .findOne({ eventId: eventObjId, userId: userObjId })
            .exec();
        if (existing) {
            if (existing.status !== (dto.status || "CONFIRMADO")) {
                existing.status = dto.status || "CONFIRMADO";
                if (dto.type)
                    existing.type = dto.type;
                if (dto.notes)
                    existing.notes = dto.notes;
                existing.confirmedAt = new Date();
                existing.confirmedBy = operatorName;
                return (await existing.save()).populate("userId");
            }
            return existing.populate("userId");
        }
        const created = new this.participantModel({
            eventId: eventObjId,
            userId: userObjId,
            type: dto.type || "ACAMPANTE",
            status: dto.status || "CONFIRMADO",
            notes: dto.notes,
            confirmedAt: new Date(),
            confirmedBy: operatorName,
        });
        const saved = await created.save();
        return saved.populate("userId");
    }
    async updateParticipant(id, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de participante inválido");
        }
        const updated = await this.participantModel
            .findByIdAndUpdate(id, dto, { new: true, returnDocument: "after" })
            .populate("userId")
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Participante não encontrado com ID ${id}`);
        }
        return updated;
    }
    async removeParticipant(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de participante inválido");
        }
        const res = await this.participantModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new common_1.NotFoundException(`Participante não encontrado com ID ${id}`);
        }
        return { success: true, message: "Participante removido do evento com sucesso" };
    }
    async getActiveEvent() {
        return this.eventModel.findOne({ isActive: true }).exec();
    }
    async submitPublicInscription(dto) {
        let targetEvent = null;
        if (dto.eventId && mongoose_2.Types.ObjectId.isValid(dto.eventId)) {
            targetEvent = await this.eventModel.findById(dto.eventId).exec();
        }
        if (!targetEvent) {
            targetEvent = await this.eventModel.findOne({ isActive: true }).exec();
        }
        if (!targetEvent) {
            throw new common_1.BadRequestException("Nenhum evento ativo encontrado para receber inscrições.");
        }
        const cleanCpf = (dto.cpf || "").replace(/\D/g, "");
        if (!cleanCpf || cleanCpf.length < 11) {
            throw new common_1.BadRequestException("CPF inválido. Por favor, informe um CPF completo com 11 dígitos.");
        }
        let user = await this.userModel.findOne({ cpf: cleanCpf }).exec();
        if (!user) {
            user = new this.userModel({
                cpf: cleanCpf,
                firstName: dto.firstName.trim(),
                lastName: dto.lastName.trim(),
                phone: dto.phone.trim(),
                email: dto.email?.trim() || undefined,
                city: dto.city?.trim() || undefined,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                parish: dto.parish?.trim() || undefined,
                role: "USER",
                active: true,
            });
            await user.save();
        }
        else {
            if (dto.firstName)
                user.firstName = dto.firstName.trim();
            if (dto.lastName)
                user.lastName = dto.lastName.trim();
            if (dto.phone)
                user.phone = dto.phone.trim();
            if (dto.email)
                user.email = dto.email.trim();
            if (dto.city)
                user.city = dto.city.trim();
            if (dto.birthDate)
                user.birthDate = new Date(dto.birthDate);
            if (dto.parish)
                user.parish = dto.parish.trim();
            await user.save();
        }
        let participant = await this.participantModel
            .findOne({
            eventId: targetEvent._id,
            userId: user._id,
        })
            .exec();
        const participantData = {
            type: dto.type,
            submittedAt: new Date(),
            weight: dto.weight,
            height: dto.height,
            referralSource: dto.referralSource,
            healthRestrictions: dto.healthRestrictions,
            lgpdAuthorized: dto.lgpdAuthorized ?? true,
            preferredRoles: dto.preferredRoles || [],
            willGiveTestimony: dto.willGiveTestimony ?? false,
            testimonyDetails: dto.testimonyDetails,
            testimonyReason: dto.testimonyReason,
            previousHfEdition: dto.previousHfEdition,
            availabilityDays: dto.availabilityDays || [],
            hasTent: dto.hasTent ?? false,
            preCampAvailability: dto.preCampAvailability ?? false,
            pastRoles: dto.pastRoles,
            estimatedGuestsCount: dto.estimatedGuestsCount ?? 0,
        };
        if (participant) {
            Object.assign(participant, participantData);
            if (participant.status === "CANCELADO") {
                participant.status = "PENDENTE";
            }
            await participant.save();
        }
        else {
            participant = new this.participantModel({
                eventId: targetEvent._id,
                userId: user._id,
                status: "PENDENTE",
                ...participantData,
            });
            await participant.save();
        }
        const populated = await this.participantModel
            .findById(participant._id)
            .populate("userId")
            .exec();
        return {
            success: true,
            message: "Inscrição realizada com sucesso! Ela está pendente de confirmação pela coordenação.",
            participant: populated,
            user: {
                id: user._id.toString(),
                name: `${user.firstName} ${user.lastName}`,
                cpf: user.cpf,
                phone: user.phone,
            },
            event: {
                id: targetEvent._id.toString(),
                name: targetEvent.name,
            },
        };
    }
    async confirmParticipant(id, operatorName = "Admin") {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de participante inválido");
        }
        const participant = await this.participantModel.findById(id).exec();
        if (!participant) {
            throw new common_1.NotFoundException("Participante não encontrado");
        }
        participant.status = "CONFIRMADO";
        participant.confirmedAt = new Date();
        participant.confirmedBy = operatorName;
        await participant.save();
        return (await participant.populate("userId")).populate("eventId");
    }
    async cancelParticipant(id, operatorName = "Admin") {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de participante inválido");
        }
        const participant = await this.participantModel.findById(id).exec();
        if (!participant) {
            throw new common_1.NotFoundException("Participante não encontrado");
        }
        participant.status = "CANCELADO";
        participant.confirmedAt = new Date();
        participant.confirmedBy = operatorName;
        await participant.save();
        return (await participant.populate("userId")).populate("eventId");
    }
    async findAllInscriptions(query) {
        const filter = {};
        if (query.eventId && mongoose_2.Types.ObjectId.isValid(query.eventId)) {
            filter.eventId = new mongoose_2.Types.ObjectId(query.eventId);
        }
        else {
            const active = await this.eventModel.findOne({ isActive: true }).exec();
            if (active) {
                filter.eventId = active._id;
            }
        }
        if (query.status && ["CONFIRMADO", "PENDENTE", "CANCELADO"].includes(query.status)) {
            filter.status = query.status;
        }
        if (query.type && ["ACAMPANTE", "TRABALHO"].includes(query.type)) {
            filter.type = query.type;
        }
        let results = await this.participantModel
            .find(filter)
            .populate("userId")
            .populate("eventId")
            .sort({ createdAt: -1 })
            .exec();
        if (query.search && query.search.trim()) {
            const term = query.search.toLowerCase().trim();
            const digits = term.replace(/\D/g, "");
            results = results.filter((p) => {
                const u = p.userId;
                if (!u)
                    return false;
                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
                const cpf = u.cpf || "";
                const phone = u.phone || "";
                return (fullName.includes(term) ||
                    (digits && cpf.includes(digits)) ||
                    phone.includes(term));
            });
        }
        return results;
    }
};
exports.EventParticipantsService = EventParticipantsService;
exports.EventParticipantsService = EventParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_participant_schema_1.EventParticipant.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], EventParticipantsService);
//# sourceMappingURL=event-participants.service.js.map