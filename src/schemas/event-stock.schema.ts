import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class EventStock extends Document {
  @Prop({ type: Types.ObjectId, ref: "Event", required: true, index: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Product", required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number, default: 0 })
  stock: number;

  @Prop({ required: true, type: Number, default: 0 })
  initialStock: number;

  @Prop({ default: 5, type: Number })
  minStock: number;

  @Prop({ type: Number })
  price?: number;

  @Prop({ default: 0, type: Number })
  totalCost: number;

  @Prop({ default: "" })
  sponsorName?: string;

  @Prop({ default: "" })
  sponsorCpf?: string;

  @Prop({ default: "" })
  sponsorPhone?: string;

  @Prop({ default: false })
  isDonation?: boolean;
}

export const EventStockSchema = SchemaFactory.createForClass(EventStock);

EventStockSchema.index({ eventId: 1, productId: 1 }, { unique: true });

EventStockSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});

EventStockSchema.set("toJSON", { virtuals: true });
EventStockSchema.set("toObject", { virtuals: true });
