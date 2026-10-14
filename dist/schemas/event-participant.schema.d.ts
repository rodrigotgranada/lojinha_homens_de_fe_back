import { Document, Types } from "mongoose";
export type ParticipantType = "ACAMPANTE" | "TRABALHO";
export type ParticipantStatus = "CONFIRMADO" | "PENDENTE" | "CANCELADO";
export declare class EventParticipant extends Document {
    eventId: Types.ObjectId;
    userId: Types.ObjectId;
    type: ParticipantType;
    status: ParticipantStatus;
    submittedAt?: Date;
    weight?: number;
    height?: number;
    referralSource?: string;
    healthRestrictions?: string;
    lgpdAuthorized?: boolean;
    preferredRoles?: string[];
    willGiveTestimony?: boolean;
    testimonyDetails?: string;
    testimonyReason?: string;
    previousHfEdition?: string;
    availabilityDays?: string[];
    hasTent?: boolean;
    preCampAvailability?: boolean;
    pastRoles?: string;
    estimatedGuestsCount?: number;
    notes?: string;
    confirmedAt?: Date;
    confirmedBy?: string;
}
export declare const EventParticipantSchema: import("mongoose").Schema<EventParticipant, import("mongoose").Model<EventParticipant, any, any, any, any, any, EventParticipant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventParticipant, Document<unknown, {}, EventParticipant, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<ParticipantType, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ParticipantStatus, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    submittedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    weight?: import("mongoose").SchemaDefinitionProperty<number | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    height?: import("mongoose").SchemaDefinitionProperty<number | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    referralSource?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    healthRestrictions?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lgpdAuthorized?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    preferredRoles?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    willGiveTestimony?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    testimonyDetails?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    testimonyReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    previousHfEdition?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    availabilityDays?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    hasTent?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    preCampAvailability?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pastRoles?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    estimatedGuestsCount?: import("mongoose").SchemaDefinitionProperty<number | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    confirmedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    confirmedBy?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventParticipant, Document<unknown, {}, EventParticipant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventParticipant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, EventParticipant>;
