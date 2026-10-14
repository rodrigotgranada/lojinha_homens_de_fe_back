import type { EventStatus } from "../../schemas/event.schema";
export declare class CreateEventDto {
    name: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    location?: string;
    status?: EventStatus;
}
export declare class UpdateEventDto {
    name?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    location?: string;
    status?: EventStatus;
}
