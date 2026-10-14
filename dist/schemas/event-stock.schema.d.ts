import { Document, Types } from "mongoose";
export declare class EventStock extends Document {
    eventId: Types.ObjectId;
    productId: Types.ObjectId;
    stock: number;
    initialStock: number;
    minStock: number;
    price?: number;
    totalCost: number;
    sponsorName?: string;
    sponsorCpf?: string;
    sponsorPhone?: string;
    isDonation?: boolean;
}
export declare const EventStockSchema: import("mongoose").Schema<EventStock, import("mongoose").Model<EventStock, any, any, any, any, any, EventStock>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventStock, Document<unknown, {}, EventStock, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    price?: import("mongoose").SchemaDefinitionProperty<number | undefined, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    stock?: import("mongoose").SchemaDefinitionProperty<number, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    initialStock?: import("mongoose").SchemaDefinitionProperty<number, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    minStock?: import("mongoose").SchemaDefinitionProperty<number, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorCpf?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorPhone?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDonation?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventStock, Document<unknown, {}, EventStock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, EventStock>;
