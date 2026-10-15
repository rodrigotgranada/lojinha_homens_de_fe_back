import { Model } from "mongoose";
import { Event } from "../schemas/event.schema";
export declare function slugifyEventName(name: string): string;
export declare class EventsService {
    private eventModel;
    constructor(eventModel: Model<Event>);
    private generateUniqueSlug;
    findAll(): Promise<Event[]>;
    findActive(): Promise<Event | null>;
    findActiveAll(): Promise<Event[]>;
    findBySlug(slug: string): Promise<Event>;
    create(createEventDto: any): Promise<Event>;
    update(id: string, updateEventDto: any): Promise<Event>;
}
