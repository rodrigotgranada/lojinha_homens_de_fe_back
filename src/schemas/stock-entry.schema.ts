import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class StockEntry extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "Product", index: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Event", index: true, required: false })
  eventId?: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, default: 0 })
  costPrice: number;

  @Prop({ required: true, type: Number, default: 0 })
  totalCost: number;

  @Prop({ default: "" })
  sponsorName?: string;

  @Prop({ default: "" })
  sponsorCpf?: string;

  @Prop({ default: "" })
  sponsorPhone?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  sponsorUserId?: Types.ObjectId;

  @Prop({ default: false, type: Boolean })
  isDonation: boolean;

  @Prop({ default: Date.now, type: Date })
  date: Date;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  createdBy?: Types.ObjectId;

  @Prop({ default: "Sistema" })
  operatorName?: string;

  @Prop({ type: Types.ObjectId, required: false })
  expenseGroupId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false })
  expenseItemId?: Types.ObjectId;
}

export const StockEntrySchema = SchemaFactory.createForClass(StockEntry);

StockEntrySchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});

StockEntrySchema.set("toJSON", { virtuals: true });
StockEntrySchema.set("toObject", { virtuals: true });
