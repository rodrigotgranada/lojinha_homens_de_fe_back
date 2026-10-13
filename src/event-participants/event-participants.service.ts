import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { EventParticipant } from "../schemas/event-participant.schema";
import { User } from "../schemas/user.schema";
import {
  CreateEventParticipantDto,
  UpdateEventParticipantDto,
} from "./dto/event-participant.dto";

@Injectable()
export class EventParticipantsService {
  constructor(
    @InjectModel(EventParticipant.name)
    private participantModel: Model<EventParticipant>,
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}

  async findByEvent(eventId: string, status?: string): Promise<EventParticipant[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("ID de evento inválido");
    }

    const filter: any = { eventId: new Types.ObjectId(eventId) };
    if (status) {
      filter.status = status;
    }

    return this.participantModel
      .find(filter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUsersByEvent(eventId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("ID de evento inválido");
    }

    const participants = await this.participantModel
      .find({
        eventId: new Types.ObjectId(eventId),
        status: "CONFIRMADO",
      })
      .populate("userId")
      .exec();

    // Map each participant to a enriched user object
    return participants
      .filter((p) => p.userId != null)
      .map((p) => {
        const userObj = typeof (p.userId as any).toObject === "function"
          ? (p.userId as any).toObject()
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

  async addParticipant(
    eventId: string,
    dto: CreateEventParticipantDto,
    operatorName = "Admin"
  ): Promise<EventParticipant> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("ID de evento inválido");
    }
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException("ID de usuário inválido");
    }

    const eventObjId = new Types.ObjectId(eventId);
    const userObjId = new Types.ObjectId(dto.userId);

    const user = await this.userModel.findById(userObjId).exec();
    if (!user) {
      throw new NotFoundException(`Usuário não encontrado com ID ${dto.userId}`);
    }

    const existing = await this.participantModel
      .findOne({ eventId: eventObjId, userId: userObjId })
      .exec();

    if (existing) {
      // If already exists but pending/cancelled, reactivate
      if (existing.status !== (dto.status || "CONFIRMADO")) {
        existing.status = dto.status || "CONFIRMADO";
        if (dto.type) existing.type = dto.type;
        if (dto.notes) existing.notes = dto.notes;
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

  async updateParticipant(
    id: string,
    dto: UpdateEventParticipantDto
  ): Promise<EventParticipant> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de participante inválido");
    }

    const updated = await this.participantModel
      .findByIdAndUpdate(id, dto, { new: true, returnDocument: "after" as any })
      .populate("userId")
      .exec();

    if (!updated) {
      throw new NotFoundException(`Participante não encontrado com ID ${id}`);
    }
    return updated;
  }

  async removeParticipant(id: string): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de participante inválido");
    }

    const res = await this.participantModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Participante não encontrado com ID ${id}`);
    }
    return { success: true, message: "Participante removido do evento com sucesso" };
  }
}
