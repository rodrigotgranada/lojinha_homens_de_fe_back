import { EventParticipantsService } from "./event-participants.service";
import { PublicInscriptionDto } from "./dto/public-inscription.dto";
export declare class InscriptionsController {
    private readonly participantsService;
    constructor(participantsService: EventParticipantsService);
    getActiveEvent(): Promise<{
        id: string;
        name: string;
        location: string | undefined;
        startDate: Date | undefined;
        endDate: Date | undefined;
        status: import("../schemas/event.schema").EventStatus;
        isActive: boolean;
    } | null>;
    submitPublicInscription(dto: PublicInscriptionDto): Promise<{
        success: boolean;
        message: string;
        participant: any;
        user: any;
        event: any;
    }>;
    findAllInscriptions(eventId?: string, status?: string, type?: string, search?: string): Promise<import("../schemas/event-participant.schema").EventParticipant[]>;
    confirmParticipant(id: string, operator?: string): Promise<import("../schemas/event-participant.schema").EventParticipant>;
    cancelParticipant(id: string, operator?: string): Promise<import("../schemas/event-participant.schema").EventParticipant>;
}
