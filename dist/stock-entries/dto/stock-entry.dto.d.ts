export declare class CreateStockEntryDto {
    productId: string;
    eventId?: string;
    quantity: number;
    costPrice?: number;
    totalCost?: number;
    sponsorName?: string;
    sponsorCpf?: string;
    sponsorPhone?: string;
    sponsorUserId?: string;
    isDonation?: boolean;
    date?: string | Date;
    notes?: string;
    operatorName?: string;
    createdBy?: string;
}
