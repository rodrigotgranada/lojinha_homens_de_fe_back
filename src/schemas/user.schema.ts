import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  cpf: string;

  @Prop()
  email?: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: ["USER", "ADMIN"], default: "USER" })
  role: string;

  @Prop()
  createdBy?: string;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  synced: boolean;

  @Prop({ type: Date, required: false })
  synchronizedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure a virtual 'id' is generated
UserSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });
