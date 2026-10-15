import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EventStatus = "PROGRAMADO" | "ATIVO" | "ENCERRADO" | "CANCELADO";

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false, index: true })
  isActive: boolean;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  slug?: string;

  @Prop({ default: "" })
  city?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  ownerId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  adminIds?: Types.ObjectId[];

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ default: "" })
  location?: string;

  @Prop({ default: "PROGRAMADO", enum: ["PROGRAMADO", "ATIVO", "ENCERRADO", "CANCELADO"] })
  status: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
EventSchema.set("toJSON", { virtuals: true });
EventSchema.set("toObject", { virtuals: true });
