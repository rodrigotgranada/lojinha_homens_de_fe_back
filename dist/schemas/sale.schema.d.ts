import { Document, Types } from "mongoose";
export declare class SaleRefund {
    amount: number;
    method: string;
    date: Date;
    reason: string;
    operator: string;
}
export declare const SaleRefundSchema: import("mongoose").Schema<SaleRefund, import("mongoose").Model<SaleRefund, any, any, any, any, any, SaleRefund>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SaleRefund, Document<unknown, {}, SaleRefund, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    amount?: import("mongoose").SchemaDefinitionProperty<number, SaleRefund, Document<unknown, {}, SaleRefund, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    method?: import("mongoose").SchemaDefinitionProperty<string, SaleRefund, Document<unknown, {}, SaleRefund, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, SaleRefund, Document<unknown, {}, SaleRefund, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string, SaleRefund, Document<unknown, {}, SaleRefund, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    operator?: import("mongoose").SchemaDefinitionProperty<string, SaleRefund, Document<unknown, {}, SaleRefund, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, SaleRefund>;
export declare class SaleItem {
    productId: Types.ObjectId;
    quantity: number;
    priceAtPurchase: number;
    costAtPurchase: number;
    returnedQuantity: number;
}
export declare const SaleItemSchema: import("mongoose").Schema<SaleItem, import("mongoose").Model<SaleItem, any, any, any, any, any, SaleItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SaleItem, Document<unknown, {}, SaleItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, SaleItem, Document<unknown, {}, SaleItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, SaleItem, Document<unknown, {}, SaleItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    priceAtPurchase?: import("mongoose").SchemaDefinitionProperty<number, SaleItem, Document<unknown, {}, SaleItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    costAtPurchase?: import("mongoose").SchemaDefinitionProperty<number, SaleItem, Document<unknown, {}, SaleItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    returnedQuantity?: import("mongoose").SchemaDefinitionProperty<number, SaleItem, Document<unknown, {}, SaleItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SaleItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, SaleItem>;
export declare class Sale extends Document {
    customerId: Types.ObjectId;
    eventId: Types.ObjectId;
    items: SaleItem[];
    totalPrice: number;
    status: string;
    refunds: SaleRefund[];
    refundedAmount: number;
    synced: boolean;
    synchronizedAt?: Date;
}
export declare const SaleSchema: import("mongoose").Schema<Sale, import("mongoose").Model<Sale, any, any, any, any, any, Sale>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Sale, Document<unknown, {}, Sale, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    synced?: import("mongoose").SchemaDefinitionProperty<boolean, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    synchronizedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    customerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    items?: import("mongoose").SchemaDefinitionProperty<SaleItem[], Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalPrice?: import("mongoose").SchemaDefinitionProperty<number, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refunds?: import("mongoose").SchemaDefinitionProperty<SaleRefund[], Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refundedAmount?: import("mongoose").SchemaDefinitionProperty<number, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Sale>;
