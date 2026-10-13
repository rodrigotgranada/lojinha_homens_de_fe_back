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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EventParticipant.name)
    private participantModel: Model<EventParticipant>
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
}
