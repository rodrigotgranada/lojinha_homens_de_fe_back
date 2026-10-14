export declare class CreateSaleItemDto {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    costAtPurchase?: number;
}
export declare class CreateSaleDto {
    customerId: string;
    eventId: string;
    items: CreateSaleItemDto[];
    totalPrice: number;
    status?: "PAGO" | "PENDENTE" | "CANCELADO";
    operatorId?: string;
}
export declare class CancelSaleDto {
    operatorId?: string;
}
export declare class UpdateSaleStatusDto {
    status: "PAGO" | "PENDENTE" | "CANCELADO";
}
export declare class ReturnItemDto {
    productId: string;
    quantity: number;
}
export declare class ReturnSaleItemsDto {
    items: ReturnItemDto[];
    reason?: string;
    refundMethod?: "DINHEIRO" | "PIX" | "OUTRO";
    operatorId?: string;
    operatorName?: string;
}
