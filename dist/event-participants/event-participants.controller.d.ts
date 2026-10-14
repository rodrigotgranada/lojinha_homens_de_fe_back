import { EventParticipantsService } from "./event-participants.service";
import { CreateEventParticipantDto, UpdateEventParticipantDto } from "./dto/event-participant.dto";
export declare class EventParticipantsController {
    private readonly participantsService;
    constructor(participantsService: EventParticipantsService);
    findByEvent(eventId: string, status?: string): Promise<import("../schemas/event-participant.schema").EventParticipant[]>;
    findUsersByEvent(eventId: string): Promise<any[]>;
    addParticipant(eventId: string, dto: CreateEventParticipantDto, operator?: string): Promise<import("../schemas/event-participant.schema").EventParticipant>;
    updateParticipant(id: string, dto: UpdateEventParticipantDto): Promise<import("../schemas/event-participant.schema").EventParticipant>;
    removeParticipant(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
