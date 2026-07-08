import { Model } from "mongoose";
import { Event } from "../schemas/event.schema";
export declare class EventsService {
    private eventModel;
    constructor(eventModel: Model<Event>);
    findAll(): Promise<Event[]>;
    findActive(): Promise<Event | null>;
    create(createEventDto: any): Promise<Event>;
    update(id: string, updateEventDto: any): Promise<Event>;
}
