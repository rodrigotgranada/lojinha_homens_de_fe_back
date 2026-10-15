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
exports.slugifyEventName = slugifyEventName;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("../schemas/event.schema");
function slugifyEventName(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
let EventsService = class EventsService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async generateUniqueSlug(baseName, existingId) {
        const baseSlug = slugifyEventName(baseName);
        let candidate = baseSlug || "retiro";
        let counter = 1;
        while (true) {
            const existing = await this.eventModel.findOne({
                slug: candidate,
                ...(existingId ? { _id: { $ne: existingId } } : {}),
            }).exec();
            if (!existing) {
                return candidate;
            }
            counter++;
            candidate = `${baseSlug}-${counter}`;
        }
    }
    async findAll() {
        return this.eventModel.find().sort({ isActive: -1, createdAt: -1 }).exec();
    }
    async findActive() {
        return this.eventModel.findOne({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    async findActiveAll() {
        return this.eventModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    async findBySlug(slug) {
        const clean = slug.toLowerCase().trim();
        const event = await this.eventModel.findOne({ slug: clean }).exec();
        if (!event) {
            throw new common_1.NotFoundException(`Retiro não encontrado para o endereço "${clean}"`);
        }
        return event;
    }
    async create(createEventDto) {
        createEventDto.status = createEventDto.status ?? "PROGRAMADO";
        if (createEventDto.isActive === undefined) {
            createEventDto.isActive = createEventDto.status === "ATIVO";
        }
        if (createEventDto.slug && createEventDto.slug.trim()) {
            createEventDto.slug = slugifyEventName(createEventDto.slug);
        }
        else {
            createEventDto.slug = await this.generateUniqueSlug(createEventDto.name);
        }
        const createdEvent = new this.eventModel(createEventDto);
        return createdEvent.save();
    }
    async update(id, updateEventDto) {
        const current = await this.eventModel.findById(id).exec();
        if (!current) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        if (updateEventDto.slug && updateEventDto.slug.trim()) {
            updateEventDto.slug = await this.generateUniqueSlug(updateEventDto.slug, id);
        }
        else if (updateEventDto.name && updateEventDto.name !== current.name && !current.slug) {
            updateEventDto.slug = await this.generateUniqueSlug(updateEventDto.name, id);
        }
        const requestedStatus = updateEventDto.status;
        const requestedActive = updateEventDto.isActive;
        if (requestedActive === true || requestedStatus === "ATIVO") {
            updateEventDto.isActive = true;
            updateEventDto.status = "ATIVO";
        }
        if (requestedStatus === "ENCERRADO" || (requestedActive === false && current.status === "ATIVO")) {
            updateEventDto.isActive = false;
            updateEventDto.status = "ENCERRADO";
        }
        if (requestedStatus === "CANCELADO") {
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