import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class SaleRefund {
  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: String, enum: ["DINHEIRO", "PIX", "CREDITO", "OUTRO"], default: "DINHEIRO" })
  method: string;

  @Prop({ required: true, type: Date, default: Date.now })
  date: Date;

  @Prop({ type: String, default: "" })
  reason: string;

  @Prop({ type: String, default: "Admin" })
  operator: string;
}

export const SaleRefundSchema = SchemaFactory.createForClass(SaleRefund);

@Schema()
export class SaleItem {
  @Prop({ required: true, type: Types.ObjectId, ref: "Product" })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  priceAtPurchase: number;

  @Prop({ default: 0, type: Number })
  costAtPurchase: number;

  @Prop({ default: 0, type: Number })
  returnedQuantity: number;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "Event", index: true })
  eventId: Types.ObjectId;

  @Prop({ type: [SaleItemSchema], required: true })
  items: SaleItem[];

  @Prop({ required: true, type: Number })
  totalPrice: number;

  @Prop({ required: true, enum: ["PAGO", "PENDENTE", "CANCELADO"], default: "PAGO", index: true })
  status: string;

  @Prop({ type: [SaleRefundSchema], default: [] })
  refunds: SaleRefund[];

  @Prop({ default: 0, type: Number })
  refundedAmount: number;

  @Prop({ type: Boolean, default: false, index: true })
  synced: boolean;

  @Prop({ type: Date, required: false })
  synchronizedAt?: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
SaleSchema.set("toJSON", { virtuals: true });
SaleSchema.set("toObject", { virtuals: true });
