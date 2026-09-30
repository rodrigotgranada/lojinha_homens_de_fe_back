import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ExpenseItemStatus = "PENDENTE" | "REEMBOLSADO_PARCIAL" | "REEMBOLSADO" | "DOACAO";

@Schema({ timestamps: true })
export class RepaymentRecord {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true, default: "PIX" })
  method: string; // PIX, DINHEIRO, TRANSFERENCIA, OUTRO

  @Prop({ default: "" })
  proofUrl?: string;

  @Prop({ default: "Admin" })
  operatorName?: string;

  @Prop({ default: "" })
  notes?: string;
}

export const RepaymentRecordSchema = SchemaFactory.createForClass(RepaymentRecord);

@Schema({ timestamps: true })
export class ExpenseItem {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number, default: 0 })
  amount: number;

  @Prop({ required: true })
  paidBy: string;

  @Prop({ default: "" })
  payerPhone?: string;

  @Prop({ default: false })
  isDonation: boolean;

  @Prop({
    required: true,
    enum: ["PENDENTE", "REEMBOLSADO_PARCIAL", "REEMBOLSADO", "DOACAO"],
    default: "PENDENTE",
  })
  status: ExpenseItemStatus;

  @Prop({ default: 0, type: Number })
  repaidAmount: number;

  @Prop({ default: "" })
  receiptUrl?: string;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ default: Date.now })
  date?: Date;

  @Prop({ type: [RepaymentRecordSchema], default: [] })
  repaymentHistory: RepaymentRecord[];
}

export const ExpenseItemSchema = SchemaFactory.createForClass(ExpenseItem);

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "Event", index: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: "OBRA" })
  category: string; // OBRA, ALIMENTACAO, ESTRUTURA, TRANSPORTE, OUTROS

  @Prop({
    required: true,
    enum: ["INFRAESTRUTURA", "OPERACIONAL", "LOJINHA_INVESTIMENTO", "LOJINHA_DOACAO"],
    default: "INFRAESTRUTURA",
  })
  nature: "INFRAESTRUTURA" | "OPERACIONAL" | "LOJINHA_INVESTIMENTO" | "LOJINHA_DOACAO"; // INFRAESTRUTURA (Obras/Pré-evento) vs OPERACIONAL (Consumíveis/Durante evento) vs LOJINHA

  @Prop({ default: "" })
  description?: string;

  @Prop({ type: [ExpenseItemSchema], default: [] })
  items: ExpenseItem[];

  @Prop({ default: 0, type: Number })
  totalAmount: number;

  @Prop({ default: 0, type: Number })
  totalRepaid: number;

  @Prop({ type: Boolean, default: false })
  synced?: boolean;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.virtual("id").get(function () {
  return this._id ? this._id.toHexString() : null;
});

ExpenseSchema.set("toJSON", { virtuals: true });
ExpenseSchema.set("toObject", { virtuals: true });
