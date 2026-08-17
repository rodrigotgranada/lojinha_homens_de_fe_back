import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class EventIncome extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "Event", index: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    type: String,
    default: "INSCRICOES",
  })
  type: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ type: Boolean, default: false })
  synced?: boolean;
}

export const EventIncomeSchema = SchemaFactory.createForClass(EventIncome);

EventIncomeSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});

EventIncomeSchema.set("toJSON", { virtuals: true });
EventIncomeSchema.set("toObject", { virtuals: true });
