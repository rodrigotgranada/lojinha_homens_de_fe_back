import { PaymentConfigService } from "./payment-config.service";
import { CreatePaymentConfigDto, UpdatePaymentConfigDto } from "./dto/payment-config.dto";
export declare class PaymentConfigController {
    private readonly paymentConfigService;
    constructor(paymentConfigService: PaymentConfigService);
    findAll(): Promise<import("../schemas/payment-config.schema").PaymentConfig[]>;
    getActive(): Promise<import("../schemas/payment-config.schema").PaymentConfig>;
    create(dto: CreatePaymentConfigDto): Promise<import("../schemas/payment-config.schema").PaymentConfig>;
    update(id: string, dto: UpdatePaymentConfigDto): Promise<import("../schemas/payment-config.schema").PaymentConfig>;
    setDefault(id: string): Promise<import("../schemas/payment-config.schema").PaymentConfig>;
    delete(id: string): Promise<import("../schemas/payment-config.schema").PaymentConfig>;
}
