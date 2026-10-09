import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto/event.dto";
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(isActive?: string): Promise<import("../schemas/event.schema").Event[]>;
    findActive(): Promise<import("../schemas/event.schema").Event | null>;
    create(createEventDto: CreateEventDto): Promise<import("../schemas/event.schema").Event>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<import("../schemas/event.schema").Event>;
}
