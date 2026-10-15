import { Document, Types } from "mongoose";
export type EventStatus = "PROGRAMADO" | "ATIVO" | "ENCERRADO" | "CANCELADO";
export declare class Event extends Document {
    name: string;
    isActive: boolean;
    slug?: string;
    city?: string;
    ownerId?: Types.ObjectId;
    adminIds?: Types.ObjectId[];
    startDate?: Date;
    endDate?: Date;
    location?: string;
    status: EventStatus;
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, any, any, Event>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, Event, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<EventStatus, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ownerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    adminIds?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[] | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string | undefined, Event, Document<unknown, {}, Event, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Event>;
