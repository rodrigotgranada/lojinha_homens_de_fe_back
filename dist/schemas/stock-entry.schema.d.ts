import { Document, Types } from "mongoose";
export declare class StockEntry extends Document {
    productId: Types.ObjectId;
    eventId?: Types.ObjectId;
    quantity: number;
    costPrice: number;
    totalCost: number;
    sponsorName?: string;
    sponsorCpf?: string;
    sponsorPhone?: string;
    sponsorUserId?: Types.ObjectId;
    isDonation: boolean;
    date: Date;
    notes?: string;
    createdBy?: Types.ObjectId;
    operatorName?: string;
    expenseGroupId?: Types.ObjectId;
    expenseItemId?: Types.ObjectId;
}
export declare const StockEntrySchema: import("mongoose").Schema<StockEntry, import("mongoose").Model<StockEntry, any, any, any, any, any, StockEntry>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, StockEntry, Document<unknown, {}, StockEntry, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorCpf?: import("mongoose").SchemaDefinitionProperty<string | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorPhone?: import("mongoose").SchemaDefinitionProperty<string | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDonation?: import("mongoose").SchemaDefinitionProperty<boolean, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    costPrice?: import("mongoose").SchemaDefinitionProperty<number, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sponsorUserId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    operatorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expenseGroupId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expenseItemId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, StockEntry, Document<unknown, {}, StockEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<StockEntry & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, StockEntry>;
