export declare class PublicInscriptionDto {
    eventId?: string;
    cpf: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    city?: string;
    birthDate?: string;
    parish?: string;
    type: "ACAMPANTE" | "TRABALHO";
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
}
