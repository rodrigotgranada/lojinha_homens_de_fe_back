import { Document, Schema as MongooseSchema } from "mongoose";
export declare class Log extends Document {
    userId: string;
    userName: string;
    action: string;
    description: string;
    metadata?: any;
}
export declare const LogSchema: MongooseSchema<Log, import("mongoose").Model<Log, any, any, any, any, any, Log>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Log, Document<unknown, {}, Log, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    metadata?: import("mongoose").SchemaDefinitionProperty<any, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userName?: import("mongoose").SchemaDefinitionProperty<string, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<string, Log, Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Log>;
