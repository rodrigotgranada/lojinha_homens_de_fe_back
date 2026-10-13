import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class PaymentConfig extends Document {
  @Prop({ required: true })
  pixKey: string;

  @Prop({ default: "EMAIL" })
  keyType: string;

  @Prop({ required: true })
  merchantName: string;

  @Prop({ default: "" })
  bankName: string;

  @Prop({ default: "" })
  city?: string;

  @Prop({ default: "" })
  description?: string;

  @Prop({ default: true })
  isDefault: boolean;

  @Prop({ default: true })
  active: boolean;
}

export const PaymentConfigSchema = SchemaFactory.createForClass(PaymentConfig);

PaymentConfigSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
PaymentConfigSchema.set("toJSON", { virtuals: true });
PaymentConfigSchema.set("toObject", { virtuals: true });
