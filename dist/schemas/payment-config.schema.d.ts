import { Document } from "mongoose";
export declare class PaymentConfig extends Document {
    pixKey: string;
    keyType: string;
    merchantName: string;
    bankName: string;
    city?: string;
    description?: string;
    isDefault: boolean;
    active: boolean;
}
export declare const PaymentConfigSchema: import("mongoose").Schema<PaymentConfig, import("mongoose").Model<PaymentConfig, any, any, any, any, any, PaymentConfig>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentConfig, Document<unknown, {}, PaymentConfig, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    active?: import("mongoose").SchemaDefinitionProperty<boolean, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pixKey?: import("mongoose").SchemaDefinitionProperty<string, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    keyType?: import("mongoose").SchemaDefinitionProperty<string, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    merchantName?: import("mongoose").SchemaDefinitionProperty<string, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bankName?: import("mongoose").SchemaDefinitionProperty<string, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDefault?: import("mongoose").SchemaDefinitionProperty<boolean, PaymentConfig, Document<unknown, {}, PaymentConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, PaymentConfig>;
