import { Document, Types } from "mongoose";
export declare class EventIncome extends Document {
    eventId: Types.ObjectId;
    title: string;
    type: string;
    amount: number;
    date: Date;
    notes?: string;
    synced?: boolean;
}
export declare const EventIncomeSchema: import("mongoose").Schema<EventIncome, import("mongoose").Model<EventIncome, any, any, any, any, any, EventIncome>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventIncome, Document<unknown, {}, EventIncome, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    synced?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, EventIncome, Document<unknown, {}, EventIncome, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventIncome & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, EventIncome>;
