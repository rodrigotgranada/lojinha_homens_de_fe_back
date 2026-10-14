export declare class CreateExpenseGroupDto {
    eventId: string;
    title: string;
    category?: string;
    nature?: "INFRAESTRUTURA" | "OPERACIONAL" | "LOJINHA_INVESTIMENTO" | "LOJINHA_DOACAO";
    description?: string;
    operatorName?: string;
}
