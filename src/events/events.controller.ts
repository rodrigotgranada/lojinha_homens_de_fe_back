import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto/event.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query("isActive") isActive?: string) {
    if (isActive === "true") {
      return this.eventsService.findActiveAll();
    }
    return this.eventsService.findAll();
  }

  @Get("by-slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Get("active")
  async findActive() {
    const active = await this.eventsService.findActive();
    if (!active) {
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
