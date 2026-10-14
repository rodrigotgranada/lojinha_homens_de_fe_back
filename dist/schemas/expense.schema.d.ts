import { Document, Types } from "mongoose";
export type ExpenseItemStatus = "PENDENTE" | "REEMBOLSADO_PARCIAL" | "REEMBOLSADO" | "DOACAO";
export declare class RepaymentRecord {
    _id: Types.ObjectId;
    amount: number;
    date: Date;
    method: string;
    proofUrl?: string;
    operatorName?: string;
    notes?: string;
}
export declare const RepaymentRecordSchema: import("mongoose").Schema<RepaymentRecord, import("mongoose").Model<RepaymentRecord, any, any, any, any, any, RepaymentRecord>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    method?: import("mongoose").SchemaDefinitionProperty<string, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    proofUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    operatorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, RepaymentRecord, Document<unknown, {}, RepaymentRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RepaymentRecord & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, RepaymentRecord>;
export declare class ExpenseItem {
    _id: Types.ObjectId;
    description: string;
    amount: number;
    paidBy: string;
    payerPhone?: string;
    isDonation: boolean;
    status: ExpenseItemStatus;
    repaidAmount: number;
    receiptUrl?: string;
    notes?: string;
    date?: Date;
    repaymentHistory: RepaymentRecord[];
}
export declare const ExpenseItemSchema: import("mongoose").Schema<ExpenseItem, import("mongoose").Model<ExpenseItem, any, any, any, any, any, ExpenseItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExpenseItem, Document<unknown, {}, ExpenseItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paidBy?: import("mongoose").SchemaDefinitionProperty<string, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    payerPhone?: import("mongoose").SchemaDefinitionProperty<string | undefined, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDonation?: import("mongoose").SchemaDefinitionProperty<boolean, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ExpenseItemStatus, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    repaidAmount?: import("mongoose").SchemaDefinitionProperty<number, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    receiptUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    repaymentHistory?: import("mongoose").SchemaDefinitionProperty<RepaymentRecord[], ExpenseItem, Document<unknown, {}, ExpenseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExpenseItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ExpenseItem>;
export declare class Expense extends Document {
    eventId: Types.ObjectId;
    title: string;
    category: string;
    nature: "INFRAESTRUTURA" | "OPERACIONAL" | "LOJINHA_INVESTIMENTO" | "LOJINHA_DOACAO";
    description?: string;
    items: ExpenseItem[];
    totalAmount: number;
    totalRepaid: number;
    synced?: boolean;
}
export declare const ExpenseSchema: import("mongoose").Schema<Expense, import("mongoose").Model<Expense, any, any, any, any, any, Expense>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Expense, Document<unknown, {}, Expense, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    synced?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    eventId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    items?: import("mongoose").SchemaDefinitionProperty<ExpenseItem[], Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    nature?: import("mongoose").SchemaDefinitionProperty<"INFRAESTRUTURA" | "OPERACIONAL" | "LOJINHA_INVESTIMENTO" | "LOJINHA_DOACAO", Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalAmount?: import("mongoose").SchemaDefinitionProperty<number, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalRepaid?: import("mongoose").SchemaDefinitionProperty<number, Expense, Document<unknown, {}, Expense, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Expense & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Expense>;
