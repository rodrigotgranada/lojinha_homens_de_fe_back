export declare class ReconciliationItemDto {
    productId: string;
    quantityToImport: number;
    writeOffQuantity?: number;
    writeOffReason?: "PERDA" | "DOACAO" | "AVARIA" | "OUTRO";
    writeOffNotes?: string;
}
export declare class ImportPreviousStockDto {
    currentEventId: string;
    previousEventId: string;
    items: ReconciliationItemDto[];
    operatorName?: string;
}
