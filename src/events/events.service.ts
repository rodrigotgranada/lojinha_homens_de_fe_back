import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "../schemas/event.schema";

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().sort({ createdAt: -1 }).exec();
  }

  async findActive(): Promise<Event | null> {
    return this.eventModel.findOne({ isActive: true }).exec();
  }

  async create(createEventDto: any): Promise<Event> {
    // New events always start as PROGRAMADO and inactive
    createEventDto.isActive = false;
    createEventDto.status = createEventDto.status ?? "PROGRAMADO";
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async update(id: string, updateEventDto: any): Promise<Event> {
    const current = await this.eventModel.findById(id).exec();
    if (!current) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const requestedStatus: string | undefined = updateEventDto.status;
    const requestedActive: boolean | undefined = updateEventDto.isActive;

    // --- Transition: INICIAR (PROGRAMADO → ATIVO) ---
    if (requestedActive === true || requestedStatus === "ATIVO") {
      // Block if another event is already active
      const alreadyActive = await this.eventModel
        .findOne({ isActive: true, _id: { $ne: id } })
        .exec();
      if (alreadyActive) {
        throw new BadRequestException(
          `O evento "${alreadyActive.name}" já está ativo. Encerre-o antes de iniciar outro.`
        );
      }
      // Deactivate all others just in case
      await this.eventModel
        .updateMany({ _id: { $ne: id } }, { isActive: false })
        .exec();
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
      if (current.isActive) {
        throw new BadRequestException(
          "Não é possível cancelar um evento que está ativo. Encerre-o primeiro."
        );
      }
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
