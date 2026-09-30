import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto/event.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query("isActive") isActive?: string) {
    if (isActive === "true") {
      const active = await this.eventsService.findActive();
      return active ? [active] : [];
    }
    return this.eventsService.findAll();
  }

  @Get("active")
  async findActive() {
    const active = await this.eventsService.findActive();
    if (!active) {
      // json-server compatibility fallback: return null or mock structure
      return null;
    }
    return active;
  }

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }
}
