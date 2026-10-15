import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "../schemas/event.schema";

export function slugifyEventName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  private async generateUniqueSlug(baseName: string, existingId?: string): Promise<string> {
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

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().sort({ isActive: -1, createdAt: -1 }).exec();
  }

  async findActive(): Promise<Event | null> {
    return this.eventModel.findOne({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findActiveAll(): Promise<Event[]> {
    return this.eventModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findBySlug(slug: string): Promise<Event> {
    const clean = slug.toLowerCase().trim();
    const event = await this.eventModel.findOne({ slug: clean }).exec();
    if (!event) {
      throw new NotFoundException(`Retiro não encontrado para o endereço "${clean}"`);
    }
    return event;
  }

  async create(createEventDto: any): Promise<Event> {
    createEventDto.status = createEventDto.status ?? "PROGRAMADO";
    if (createEventDto.isActive === undefined) {
      createEventDto.isActive = createEventDto.status === "ATIVO";
    }

    if (createEventDto.slug && createEventDto.slug.trim()) {
      createEventDto.slug = slugifyEventName(createEventDto.slug);
    } else {
      createEventDto.slug = await this.generateUniqueSlug(createEventDto.name);
    }

    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async update(id: string, updateEventDto: any): Promise<Event> {
    const current = await this.eventModel.findById(id).exec();
    if (!current) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Ensure slug is valid if updated
    if (updateEventDto.slug && updateEventDto.slug.trim()) {
      updateEventDto.slug = await this.generateUniqueSlug(updateEventDto.slug, id);
    } else if (updateEventDto.name && updateEventDto.name !== current.name && !current.slug) {
      updateEventDto.slug = await this.generateUniqueSlug(updateEventDto.name, id);
    }

    const requestedStatus: string | undefined = updateEventDto.status;
    const requestedActive: boolean | undefined = updateEventDto.isActive;

    // --- Transition: INICIAR / ATIVAR (Multiple events can be active simultaneously!) ---
    if (requestedActive === true || requestedStatus === "ATIVO") {
      updateEventDto.isActive = true;
      updateEventDto.status = "ATIVO";
    }

    // --- Transition: ENCERRAR (ATIVO → ENCERRADO) ---
    if (requestedStatus === "ENCERRADO" || (requestedActive === false && current.status === "ATIVO")) {
      updateEventDto.isActive = false;
      updateEventDto.status = "ENCERRADO";
    }

    // --- Transition: CANCELAR (PROGRAMADO → CANCELADO) ---
    if (requestedStatus === "CANCELADO") {
      updateEventDto.isActive = false;
      updateEventDto.status = "CANCELADO";
    }

    // --- Transition: REPROGRAMAR (CANCELADO → PROGRAMADO) ---
    if (requestedStatus === "PROGRAMADO" && current.status === "CANCELADO") {
      updateEventDto.isActive = false;
      updateEventDto.status = "PROGRAMADO";
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true, returnDocument: "after" as any })
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }
}
