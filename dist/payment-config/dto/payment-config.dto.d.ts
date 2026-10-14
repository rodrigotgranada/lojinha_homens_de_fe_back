export declare class CreatePaymentConfigDto {
    pixKey: string;
    keyType?: string;
    merchantName: string;
    bankName?: string;
    city?: string;
    description?: string;
    isDefault?: boolean;
}
export declare class UpdatePaymentConfigDto {
    pixKey?: string;
    keyType?: string;
    merchantName?: string;
    bankName?: string;
    city?: string;
    description?: string;
    isDefault?: boolean;
    active?: boolean;
}
