import { EventsService } from "./events.service";
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(isActive?: string): Promise<import("../schemas/event.schema").Event[]>;
    findActive(): Promise<import("../schemas/event.schema").Event | null>;
    create(createEventDto: any): Promise<import("../schemas/event.schema").Event>;
    update(id: string, updateEventDto: any): Promise<import("../schemas/event.schema").Event>;
}
