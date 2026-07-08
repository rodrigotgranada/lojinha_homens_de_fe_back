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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("../schemas/event.schema");
let EventsService = class EventsService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async findAll() {
        return this.eventModel.find().sort({ createdAt: -1 }).exec();
    }
    async findActive() {
        return this.eventModel.findOne({ isActive: true }).exec();
    }
    async create(createEventDto) {
        createEventDto.isActive = false;
        createEventDto.status = createEventDto.status ?? "PROGRAMADO";
        const createdEvent = new this.eventModel(createEventDto);
        return createdEvent.save();
    }
    async update(id, updateEventDto) {
        const current = await this.eventModel.findById(id).exec();
        if (!current) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        const requestedStatus = updateEventDto.status;
        const requestedActive = updateEventDto.isActive;
        if (requestedActive === true || requestedStatus === "ATIVO") {
            const alreadyActive = await this.eventModel
                .findOne({ isActive: true, _id: { $ne: id } })
                .exec();
            if (alreadyActive) {
                throw new common_1.BadRequestException(`O evento "${alreadyActive.name}" já está ativo. Encerre-o antes de iniciar outro.`);
            }
            await this.eventModel
                .updateMany({ _id: { $ne: id } }, { isActive: false })
                .exec();
            updateEventDto.isActive = true;
            updateEventDto.status = "ATIVO";
        }
        if (requestedStatus === "ENCERRADO" || (requestedActive === false && current.status === "ATIVO")) {
            updateEventDto.isActive = false;
            updateEventDto.status = "ENCERRADO";
        }
        if (requestedStatus === "CANCELADO") {
            if (current.isActive) {
                throw new common_1.BadRequestException("Não é possível cancelar um evento que está ativo. Encerre-o primeiro.");
            }
            updateEventDto.isActive = false;
            updateEventDto.status = "CANCELADO";
        }
        if (requestedStatus === "PROGRAMADO" && current.status === "CANCELADO") {
            updateEventDto.isActive = false;
            updateEventDto.status = "PROGRAMADO";
        }
        const updatedEvent = await this.eventModel
            .findByIdAndUpdate(id, updateEventDto, { new: true, returnDocument: "after" })
            .exec();
        if (!updatedEvent) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        return updatedEvent;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsService);
//# sourceMappingURL=events.service.js.map