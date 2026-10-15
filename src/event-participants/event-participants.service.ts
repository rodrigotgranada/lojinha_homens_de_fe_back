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
import { Event } from "../schemas/event.schema";
import {
  CreateEventParticipantDto,
  UpdateEventParticipantDto,
} from "./dto/event-participant.dto";
import { PublicInscriptionDto } from "./dto/public-inscription.dto";

@Injectable()
export class EventParticipantsService {
  constructor(
    @InjectModel(EventParticipant.name)
    private participantModel: Model<EventParticipant>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>
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

  async getActiveEvent(): Promise<Event | null> {
    return this.eventModel.findOne({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const clean = slug.toLowerCase().trim();
    return this.eventModel.findOne({ slug: clean }).exec();
  }

  async submitPublicInscription(dto: PublicInscriptionDto): Promise<{
    success: boolean;
    message: string;
    participant: any;
    user: any;
    event: any;
  }> {
    // 1. Resolve event (by id, by slug, or fallback to active event)
    let targetEvent: Event | null = null;
    if (dto.eventId && Types.ObjectId.isValid(dto.eventId)) {
      targetEvent = await this.eventModel.findById(dto.eventId).exec();
    }
    if (!targetEvent && dto.eventSlug) {
      targetEvent = await this.getEventBySlug(dto.eventSlug);
    }
    if (!targetEvent) {
      targetEvent = await this.eventModel.findOne({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    if (!targetEvent) {
      throw new BadRequestException("Nenhum evento ativo ou compatível encontrado para receber inscrições.");
    }

    // 2. Clean CPF
    const cleanCpf = (dto.cpf || "").replace(/\D/g, "");
    if (!cleanCpf || cleanCpf.length < 11) {
      throw new BadRequestException("CPF inválido. Por favor, informe um CPF completo com 11 dígitos.");
    }

    // 3. Upsert User
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
    } else {
      if (dto.firstName) user.firstName = dto.firstName.trim();
      if (dto.lastName) user.lastName = dto.lastName.trim();
      if (dto.phone) user.phone = dto.phone.trim();
      if (dto.email) user.email = dto.email.trim();
      if (dto.city) user.city = dto.city.trim();
      if (dto.birthDate) user.birthDate = new Date(dto.birthDate);
      if (dto.parish) user.parish = dto.parish.trim();
      await user.save();
    }

    // 4. Upsert EventParticipant
    let participant = await this.participantModel
      .findOne({
        eventId: targetEvent._id,
        userId: user._id,
      })
      .exec();

    const participantData: any = {
      type: dto.type,
      submittedAt: new Date(),
      // ACAMPANTE fields
      weight: dto.weight,
      height: dto.height,
      referralSource: dto.referralSource,
      healthRestrictions: dto.healthRestrictions,
      lgpdAuthorized: dto.lgpdAuthorized ?? true,
      // TRABALHO fields
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
    } else {
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

  async confirmParticipant(id: string, operatorName = "Admin"): Promise<EventParticipant> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de participante inválido");
    }

    const participant = await this.participantModel.findById(id).exec();
    if (!participant) {
      throw new NotFoundException("Participante não encontrado");
    }

    participant.status = "CONFIRMADO";
    participant.confirmedAt = new Date();
    participant.confirmedBy = operatorName;
    await participant.save();

    return (await participant.populate("userId")).populate("eventId");
  }

  async cancelParticipant(id: string, operatorName = "Admin"): Promise<EventParticipant> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de participante inválido");
    }

    const participant = await this.participantModel.findById(id).exec();
    if (!participant) {
      throw new NotFoundException("Participante não encontrado");
    }

    participant.status = "CANCELADO";
    participant.confirmedAt = new Date();
    participant.confirmedBy = operatorName;
    await participant.save();

    return (await participant.populate("userId")).populate("eventId");
  }

  async findAllInscriptions(query: {
    eventId?: string;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<EventParticipant[]> {
    const filter: any = {};

    if (query.eventId && Types.ObjectId.isValid(query.eventId)) {
      filter.eventId = new Types.ObjectId(query.eventId);
    } else {
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
      results = results.filter((p: any) => {
        const u = p.userId;
        if (!u) return false;
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        const cpf = u.cpf || "";
        const phone = u.phone || "";
        return (
          fullName.includes(term) ||
          (digits && cpf.includes(digits)) ||
          phone.includes(term)
        );
      });
    }

    return results;
  }
}
