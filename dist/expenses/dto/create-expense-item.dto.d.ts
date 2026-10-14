export declare class CreateExpenseItemDto {
    description: string;
    amount: number;
    paidBy: string;
    payerPhone?: string;
    isDonation?: boolean;
    notes?: string;
    receiptUrl?: string;
    operatorName?: string;
}
export declare class UpdateExpenseItemDto {
    description?: string;
    amount?: number;
    paidBy?: string;
    payerPhone?: string;
    isDonation?: boolean;
    status?: "PENDENTE" | "REEMBOLSADO_PARCIAL" | "REEMBOLSADO" | "DOACAO";
    repaidAmount?: number;
    notes?: string;
    receiptUrl?: string;
    operatorName?: string;
}
