import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  stock: number;

  @Prop({ default: 0, type: Number })
  initialStock: number;

  @Prop({ type: Types.ObjectId, ref: "Product" })
  importedFrom?: Types.ObjectId;

  @Prop({ default: "" })
  imageUrl: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: "Category", index: true })
  categoryRef: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Event", index: true, required: false })
  eventId?: Types.ObjectId;

  @Prop({ default: 5, type: Number })
  minStock: number;

  @Prop({ type: Types.ObjectId, ref: "User", index: true })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", index: true })
  updatedBy?: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});

// Virtual category name mapping for client compatibility
ProductSchema.virtual("category").get(function () {
  if (this.categoryRef && typeof this.categoryRef === "object" && "name" in this.categoryRef) {
    return (this.categoryRef as any).name;
  }
  return "Outros";
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });
