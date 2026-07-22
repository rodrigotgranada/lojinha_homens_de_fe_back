import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ default: true })
  active: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});
CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });
