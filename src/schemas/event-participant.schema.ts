import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ParticipantType = "ACAMPANTE" | "TRABALHO";
export type ParticipantStatus = "CONFIRMADO" | "PENDENTE" | "CANCELADO";

@Schema({ timestamps: true })
export class EventParticipant extends Document {
  @Prop({ type: Types.ObjectId, ref: "Event", required: true, index: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ["ACAMPANTE", "TRABALHO"], default: "ACAMPANTE" })
  type: ParticipantType;

  @Prop({ required: true, enum: ["CONFIRMADO", "PENDENTE", "CANCELADO"], default: "PENDENTE" })
  status: ParticipantStatus;

  @Prop({ type: Date, default: Date.now })
  submittedAt?: Date;

  // --- Campos específicos de ACAMPANTE ---
  @Prop()
  weight?: number;

  @Prop()
  height?: number;

  @Prop()
  referralSource?: string;

  @Prop()
  healthRestrictions?: string;

  @Prop({ default: false })
  lgpdAuthorized?: boolean;

  // --- Campos específicos de EQUIPE DE TRABALHO ---
  @Prop({ type: [String], default: [] })
  preferredRoles?: string[];

  @Prop({ default: false })
  willGiveTestimony?: boolean;

  @Prop()
  testimonyDetails?: string;

  @Prop()
  testimonyReason?: string;

  @Prop()
  previousHfEdition?: string;

  @Prop({ type: [String], default: [] })
  availabilityDays?: string[];

  @Prop({ default: false })
  hasTent?: boolean;

  @Prop({ default: false })
  preCampAvailability?: boolean;

  @Prop()
  pastRoles?: string;

  @Prop({ default: 0 })
  estimatedGuestsCount?: number;

  // --- Gestão e Auditoria Interna ---
  @Prop()
  notes?: string;

  @Prop({ type: Date })
  confirmedAt?: Date;

  @Prop()
  confirmedBy?: string;
}

export const EventParticipantSchema = SchemaFactory.createForClass(EventParticipant);

EventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Virtual id
EventParticipantSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
EventParticipantSchema.set("toJSON", { virtuals: true });
EventParticipantSchema.set("toObject", { virtuals: true });
