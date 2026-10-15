import { Model } from "mongoose";
import { EventParticipant } from "../schemas/event-participant.schema";
import { User } from "../schemas/user.schema";
import { Event } from "../schemas/event.schema";
import { CreateEventParticipantDto, UpdateEventParticipantDto } from "./dto/event-participant.dto";
import { PublicInscriptionDto } from "./dto/public-inscription.dto";
export declare class EventParticipantsService {
    private participantModel;
    private userModel;
    private eventModel;
    constructor(participantModel: Model<EventParticipant>, userModel: Model<User>, eventModel: Model<Event>);
    findByEvent(eventId: string, status?: string): Promise<EventParticipant[]>;
    findUsersByEvent(eventId: string): Promise<any[]>;
    addParticipant(eventId: string, dto: CreateEventParticipantDto, operatorName?: string): Promise<EventParticipant>;
    updateParticipant(id: string, dto: UpdateEventParticipantDto): Promise<EventParticipant>;
    removeParticipant(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveEvent(): Promise<Event | null>;
    getEventBySlug(slug: string): Promise<Event | null>;
    submitPublicInscription(dto: PublicInscriptionDto): Promise<{
        success: boolean;
        message: string;
        participant: any;
        user: any;
        event: any;
    }>;
    confirmParticipant(id: string, operatorName?: string): Promise<EventParticipant>;
    cancelParticipant(id: string, operatorName?: string): Promise<EventParticipant>;
    findAllInscriptions(query: {
        eventId?: string;
        status?: string;
        type?: string;
        search?: string;
    }): Promise<EventParticipant[]>;
}
