import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "../schemas/user.schema";
import { EventParticipant } from "../schemas/event-participant.schema";
import { Sale } from "../schemas/sale.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EventParticipant.name)
    private participantModel: Model<EventParticipant>,
    @InjectModel(Sale.name)
    private saleModel: Model<Sale>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByEvent(eventId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      return [];
    }

    const participants = await this.participantModel
      .find({
        eventId: new Types.ObjectId(eventId),
        status: "CONFIRMADO",
      })
      .populate("userId")
      .exec();

    return participants
      .filter((p) => p.userId != null)
      .map((p) => {
        const u = typeof (p.userId as any).toObject === "function"
          ? (p.userId as any).toObject()
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

  async searchUsers(query: string, eventId?: string): Promise<any[]> {
    const clean = (query || "").trim();
    const digits = clean.replace(/\D/g, "");

    const filter: any = {};
    if (digits.length >= 3) {
      filter.$or = [
        { cpf: { $regex: digits, $options: "i" } },
        { firstName: { $regex: clean, $options: "i" } },
        { lastName: { $regex: clean, $options: "i" } },
      ];
    } else if (clean.length > 0) {
      filter.$or = [
        { firstName: { $regex: clean, $options: "i" } },
        { lastName: { $regex: clean, $options: "i" } },
      ];
    }

    const users = await this.userModel.find(filter).limit(25).exec();

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return users.map((u) => ({
        ...(u.toObject ? u.toObject() : u),
        id: u._id.toString(),
        isParticipantInEvent: false,
      }));
    }

    const userIds = users.map((u) => u._id);
    const participants = await this.participantModel
      .find({
        eventId: new Types.ObjectId(eventId),
        userId: { $in: userIds },
      })
      .exec();

    const participantMap = new Map<string, any>();
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

  async linkToEvent(
    userId: string,
    eventId: string,
    type: "ACAMPANTE" | "TRABALHO" = "ACAMPANTE",
    operatorName = "PDV"
  ): Promise<any> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("IDs inválidos");
    }

    const userObjId = new Types.ObjectId(userId);
    const eventObjId = new Types.ObjectId(eventId);

    const user = await this.userModel.findById(userObjId).exec();
    if (!user) {
      throw new NotFoundException(`Usuário não encontrado`);
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
    } else {
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

  async findOneByCpf(cpf: string): Promise<User | null> {
    return this.userModel.findOne({ cpf }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: any): Promise<User> {
    const existingUser = await this.findOneByCpf(createUserDto.cpf);
    if (existingUser) {
      throw new ConflictException(`User with CPF ${createUserDto.cpf} already exists`);
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    if (updateUserDto.cpf) {
      const existingUser = await this.findOneByCpf(updateUserDto.cpf);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException(`CPF ${updateUserDto.cpf} já está cadastrado em outro usuário.`);
      }
    }
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true, returnDocument: "after" as any })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }

  async markCharged(id: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: { lastChargedAt: new Date() },
          $inc: { chargeCount: 1 },
        },
        { returnDocument: "after" as any }
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }

  async getUserFullHistory(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("ID de usuário inválido");
    }

    const userObjId = new Types.ObjectId(userId);
    const user = await this.userModel.findById(userObjId).exec();
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    // 1. Participações em eventos
    const participations = await this.participantModel
      .find({ userId: userObjId })
      .populate("eventId")
      .sort({ createdAt: -1 })
      .exec();

    // 2. Vendas/compras na Lojinha
    const sales = await this.saleModel
      .find({ customerId: userObjId })
      .populate("eventId")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .exec();

    // Sumarização financeira
    const totalSpent = sales
      .filter((s) => s.status === "PAGO")
      .reduce((sum, s) => sum + (s.totalPrice || 0) - (s.refundedAmount || 0), 0);

    const totalPending = sales
      .filter((s) => s.status === "PENDENTE")
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);

    // Agrupamento de compras por evento
    const salesByEventMap = new Map<string, any>();
    sales.forEach((s) => {
      const ev = s.eventId as any;
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
      } else if (s.status === "PENDENTE") {
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
        eventId: (p.eventId as any)?._id?.toString() || p.eventId,
        eventName: (p.eventId as any)?.name || "Retiro",
        eventStatus: (p.eventId as any)?.status,
        eventStartDate: (p.eventId as any)?.startDate,
        eventEndDate: (p.eventId as any)?.endDate,
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
}
