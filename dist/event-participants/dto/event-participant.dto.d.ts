export declare class CreateEventParticipantDto {
    userId: string;
    type?: "ACAMPANTE" | "TRABALHO";
    status?: "CONFIRMADO" | "PENDENTE" | "CANCELADO";
    notes?: string;
}
export declare class UpdateEventParticipantDto {
    type?: "ACAMPANTE" | "TRABALHO";
    status?: "CONFIRMADO" | "PENDENTE" | "CANCELADO";
    notes?: string;
}
