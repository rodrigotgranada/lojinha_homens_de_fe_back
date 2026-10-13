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

  @Prop({ required: true, enum: ["CONFIRMADO", "PENDENTE", "CANCELADO"], default: "CONFIRMADO" })
  status: ParticipantStatus;

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
