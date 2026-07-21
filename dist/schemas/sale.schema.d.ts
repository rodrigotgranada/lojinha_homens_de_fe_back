import { Document, Types } from "mongoose";
declare class SaleItem {
    productId: Types.ObjectId;
    quantity: number;
    priceAtPurchase: number;
}
export declare class Sale extends Document {
    customerId: Types.ObjectId;
    eventId: Types.ObjectId;
    items: SaleItem[];
    totalPrice: number;
    status: string;
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
    customerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Sale, Document<unknown, {}, Sale, {
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
    status?: import("mongoose").SchemaDefinitionProperty<string, Sale, Document<unknown, {}, Sale, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Sale & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Sale>;
export {};
