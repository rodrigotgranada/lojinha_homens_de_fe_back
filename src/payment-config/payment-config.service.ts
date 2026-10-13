import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentConfig } from "../schemas/payment-config.schema";
import { CreatePaymentConfigDto, UpdatePaymentConfigDto } from "./dto/payment-config.dto";

@Injectable()
export class PaymentConfigService {
  constructor(
    @InjectModel(PaymentConfig.name) private paymentConfigModel: Model<PaymentConfig>
  ) {}

  async findAll(): Promise<PaymentConfig[]> {
    const list = await this.paymentConfigModel
      .find({ active: { $ne: false } })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();

    // Se estiver vazio, gera a configuração padrão oficial inicial
    if (list.length === 0) {
      const initial = await this.paymentConfigModel.create({
        pixKey: "homensdefe.pel@gmail.com",
        keyType: "EMAIL",
        merchantName: "Alcides",
        bankName: "Nubank",
        city: "Pelotas",
        description: "Chave Oficial do Retiro",
        isDefault: true,
        active: true,
      });
      return [initial];
    }

    return list;
  }

  async getActive(): Promise<PaymentConfig> {
    // 1. Tenta achar a padrão ativa
    let activeConfig = await this.paymentConfigModel
      .findOne({ active: { $ne: false }, isDefault: true })
      .exec();

    // 2. Se não houver com isDefault: true, pega a primeira ativa
    if (!activeConfig) {
      activeConfig = await this.paymentConfigModel
        .findOne({ active: { $ne: false } })
        .sort({ createdAt: -1 })
        .exec();
    }

    // 3. Se não houver nenhuma, cria a padrão inicial
    if (!activeConfig) {
      activeConfig = await this.paymentConfigModel.create({
        pixKey: "homensdefe.pel@gmail.com",
        keyType: "EMAIL",
        merchantName: "Alcides",
        bankName: "Nubank",
        city: "Pelotas",
        description: "Chave Oficial do Retiro",
        isDefault: true,
        active: true,
      });
    }

    return activeConfig;
  }

  async create(dto: CreatePaymentConfigDto): Promise<PaymentConfig> {
    const shouldBeDefault = dto.isDefault ?? true;

    if (shouldBeDefault) {
      await this.paymentConfigModel.updateMany({}, { isDefault: false }).exec();
    }

    const created = await this.paymentConfigModel.create({
      ...dto,
      isDefault: shouldBeDefault,
      active: true,
    });

    return created;
  }

  async update(id: string, dto: UpdatePaymentConfigDto): Promise<PaymentConfig> {
    if (dto.isDefault) {
      await this.paymentConfigModel.updateMany({ _id: { $ne: id } }, { isDefault: false }).exec();
    }

    const updated = await this.paymentConfigModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { returnDocument: "after" as any }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
    }

    return updated;
  }

  async setDefault(id: string): Promise<PaymentConfig> {
    await this.paymentConfigModel.updateMany({}, { isDefault: false }).exec();
    const updated = await this.paymentConfigModel.findByIdAndUpdate(
      id,
      { isDefault: true, active: true },
      { returnDocument: "after" as any }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
    }

    return updated;
  }

  async delete(id: string): Promise<PaymentConfig> {
    const updated = await this.paymentConfigModel.findByIdAndUpdate(
      id,
      { active: false, isDefault: false },
      { returnDocument: "after" as any }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
    }

    // Se a excluída era a padrão, garante que outra passe a ser a padrão
    const remaining = await this.paymentConfigModel.findOne({ active: { $ne: false } }).exec();
    if (remaining) {
      remaining.isDefault = true;
      await remaining.save();
    }

    return updated;
  }
}
