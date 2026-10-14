import { Model } from "mongoose";
import { PaymentConfig } from "../schemas/payment-config.schema";
import { CreatePaymentConfigDto, UpdatePaymentConfigDto } from "./dto/payment-config.dto";
export declare class PaymentConfigService {
    private paymentConfigModel;
    constructor(paymentConfigModel: Model<PaymentConfig>);
    findAll(): Promise<PaymentConfig[]>;
    getActive(): Promise<PaymentConfig>;
    create(dto: CreatePaymentConfigDto): Promise<PaymentConfig>;
    update(id: string, dto: UpdatePaymentConfigDto): Promise<PaymentConfig>;
    setDefault(id: string): Promise<PaymentConfig>;
    delete(id: string): Promise<PaymentConfig>;
}
