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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const event_participant_schema_1 = require("../schemas/event-participant.schema");
const sale_schema_1 = require("../schemas/sale.schema");
let UsersService = class UsersService {
    userModel;
    participantModel;
    saleModel;
    constructor(userModel, participantModel, saleModel) {
        this.userModel = userModel;
        this.participantModel = participantModel;
        this.saleModel = saleModel;
    }
    async findAll() {
        return this.userModel.find().exec();
    }
    async findByEvent(eventId) {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            return [];
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
            const u = typeof p.userId.toObject === "function"
                ? p.userId.toObject()
                : p.userId;
            return {
                ...u,
                id: u._id ? u._id.toString() : u.id,
                eventParticipantId: p._id.toString(),
                participantType: p.type,
                participantStatus: p.status,
                isParticipantInEvent: true,
            };
        });
    }
    async searchUsers(query, eventId) {
        const clean = (query || "").trim();
        const digits = clean.replace(/\D/g, "");
        const filter = {};
        if (digits.length >= 3) {
            filter.$or = [
                { cpf: { $regex: digits, $options: "i" } },
                { firstName: { $regex: clean, $options: "i" } },
                { lastName: { $regex: clean, $options: "i" } },
            ];
        }
        else if (clean.length > 0) {
            filter.$or = [
                { firstName: { $regex: clean, $options: "i" } },
                { lastName: { $regex: clean, $options: "i" } },
            ];
        }
        const users = await this.userModel.find(filter).limit(25).exec();
        if (!eventId || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            return users.map((u) => ({
                ...(u.toObject ? u.toObject() : u),
                id: u._id.toString(),
                isParticipantInEvent: false,
            }));
        }
        const userIds = users.map((u) => u._id);
        const participants = await this.participantModel
            .find({
            eventId: new mongoose_2.Types.ObjectId(eventId),
            userId: { $in: userIds },
        })
            .exec();
        const participantMap = new Map();
        participants.forEach((p) => {
            participantMap.set(p.userId.toString(), p);
        });
        return users.map((u) => {
            const p = participantMap.get(u._id.toString());
            return {
                ...(u.toObject ? u.toObject() : u),
                id: u._id.toString(),
                isParticipantInEvent: !!(p && p.status === "CONFIRMADO"),
                participantType: p ? p.type : null,
                participantStatus: p ? p.status : null,
                eventParticipantId: p ? p._id.toString() : null,
            };
        });
    }
    async linkToEvent(userId, eventId, type = "ACAMPANTE", operatorName = "PDV") {
        if (!mongoose_2.Types.ObjectId.isValid(userId) || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("IDs inválidos");
        }
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const eventObjId = new mongoose_2.Types.ObjectId(eventId);
        const user = await this.userModel.findById(userObjId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Usuário não encontrado`);
        }
        let participant = await this.participantModel
            .findOne({ eventId: eventObjId, userId: userObjId })
            .exec();
        if (!participant) {
            participant = new this.participantModel({
                eventId: eventObjId,
                userId: userObjId,
                type,
                status: "CONFIRMADO",
                confirmedAt: new Date(),
                confirmedBy: operatorName,
                notes: "Vinculado via PDV/Admin",
            });
            await participant.save();
        }
        else {
            participant.status = "CONFIRMADO";
            participant.confirmedAt = new Date();
            participant.confirmedBy = operatorName;
            await participant.save();
        }
        return {
            ...(user.toObject ? user.toObject() : user),
            id: user._id.toString(),
            isParticipantInEvent: true,
            participantType: participant.type,
            participantStatus: participant.status,
            eventParticipantId: participant._id.toString(),
        };
    }
    async findOneByCpf(cpf) {
        return this.userModel.findOne({ cpf }).exec();
    }
    async findOne(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async create(createUserDto) {
        const existingUser = await this.findOneByCpf(createUserDto.cpf);
        if (existingUser) {
            throw new common_1.ConflictException(`User with CPF ${createUserDto.cpf} already exists`);
        }
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.cpf) {
            const existingUser = await this.findOneByCpf(updateUserDto.cpf);
            if (existingUser && existingUser._id.toString() !== id) {
                throw new common_1.ConflictException(`CPF ${updateUserDto.cpf} já está cadastrado em outro usuário.`);
            }
        }
        const updated = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true, returnDocument: "after" })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return updated;
    }
    async markCharged(id) {
        const updated = await this.userModel
            .findByIdAndUpdate(id, {
            $set: { lastChargedAt: new Date() },
            $inc: { chargeCount: 1 },
        }, { returnDocument: "after" })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return updated;
    }
    async getUserFullHistory(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException("ID de usuário inválido");
        }
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const user = await this.userModel.findById(userObjId).exec();
        if (!user) {
            throw new common_1.NotFoundException("Usuário não encontrado");
        }
        const participations = await this.participantModel
            .find({ userId: userObjId })
            .populate("eventId")
            .sort({ createdAt: -1 })
            .exec();
        const sales = await this.saleModel
            .find({ customerId: userObjId })
            .populate("eventId")
            .populate("items.productId")
            .sort({ createdAt: -1 })
            .exec();
        const totalSpent = sales
            .filter((s) => s.status === "PAGO")
            .reduce((sum, s) => sum + (s.totalPrice || 0) - (s.refundedAmount || 0), 0);
        const totalPending = sales
            .filter((s) => s.status === "PENDENTE")
            .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
        const salesByEventMap = new Map();
        sales.forEach((s) => {
            const ev = s.eventId;
            const evId = ev ? (ev._id ? ev._id.toString() : ev.toString()) : "sem-evento";
            const evName = ev?.name || "Outro Evento";
            if (!salesByEventMap.has(evId)) {
                salesByEventMap.set(evId, {
                    eventId: evId,
                    eventName: evName,
                    totalSpent: 0,
                    totalPending: 0,
                    salesCount: 0,
                    sales: [],
                });
            }
            const group = salesByEventMap.get(evId);
            group.salesCount += 1;
            if (s.status === "PAGO") {
                group.totalSpent += (s.totalPrice || 0) - (s.refundedAmount || 0);
            }
            else if (s.status === "PENDENTE") {
                group.totalPending += s.totalPrice || 0;
            }
            group.sales.push(s);
        });
        return {
            user: {
                ...(user.toObject ? user.toObject() : user),
                id: user._id.toString(),
            },
            participations: participations.map((p) => ({
                id: p._id.toString(),
                eventId: p.eventId?._id?.toString() || p.eventId,
                eventName: p.eventId?.name || "Retiro",
                eventStatus: p.eventId?.status,
                eventStartDate: p.eventId?.startDate,
                eventEndDate: p.eventId?.endDate,
                type: p.type,
                status: p.status,
                submittedAt: p.submittedAt,
                confirmedAt: p.confirmedAt,
                confirmedBy: p.confirmedBy,
                healthRestrictions: p.healthRestrictions,
                weight: p.weight,
                height: p.height,
                preferredRoles: p.preferredRoles,
                willGiveTestimony: p.willGiveTestimony,
                testimonyDetails: p.testimonyDetails,
                availabilityDays: p.availabilityDays,
                hasTent: p.hasTent,
                preCampAvailability: p.preCampAvailability,
                pastRoles: p.pastRoles,
                estimatedGuestsCount: p.estimatedGuestsCount,
            })),
            financialSummary: {
                totalSpent,
                totalPending,
                totalPurchases: sales.length,
            },
            salesByEvent: Array.from(salesByEventMap.values()),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_participant_schema_1.EventParticipant.name)),
    __param(2, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map