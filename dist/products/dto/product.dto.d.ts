export declare class CreateProductDto {
    name: string;
    price: number;
    stock: number;
    initialStock?: number;
    imageUrl?: string;
    active?: boolean;
    category?: string;
    eventId?: string;
    minStock?: number;
    totalCost?: number;
    sponsorName?: string;
    sponsorCpf?: string;
    sponsorPhone?: string;
    isDonation?: boolean;
    createdBy?: string;
    updatedBy?: string;
}
export declare class UpdateProductDto {
    name?: string;
    price?: number;
    stock?: number;
    initialStock?: number;
    imageUrl?: string;
    active?: boolean;
    category?: string;
    eventId?: string;
    minStock?: number;
    updatedBy?: string;
    totalCost?: number;
    sponsorName?: string;
    sponsorCpf?: string;
    sponsorPhone?: string;
    isDonation?: boolean;
}
export declare class UpdateStockDto {
    stock: number;
}
