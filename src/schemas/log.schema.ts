import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  userName: string;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
LogSchema.set("toJSON", { virtuals: true });
LogSchema.set("toObject", { virtuals: true });
