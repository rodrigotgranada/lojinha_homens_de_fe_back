import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { EventParticipantsService } from "./event-participants.service";
import {
  CreateEventParticipantDto,
  UpdateEventParticipantDto,
} from "./dto/event-participant.dto";

@Controller("events/:eventId/participants")
export class EventParticipantsController {
  constructor(
    private readonly participantsService: EventParticipantsService
  ) {}

  @Get()
  async findByEvent(
    @Param("eventId") eventId: string,
    @Query("status") status?: string
  ) {
    return this.participantsService.findByEvent(eventId, status);
  }

  @Get("users")
  async findUsersByEvent(@Param("eventId") eventId: string) {
    return this.participantsService.findUsersByEvent(eventId);
  }

  @Post()
  async addParticipant(
    @Param("eventId") eventId: string,
    @Body() dto: CreateEventParticipantDto,
    @Query("operator") operator?: string
  ) {
    return this.participantsService.addParticipant(eventId, dto, operator || "Admin");
  }

  @Patch(":id")
  async updateParticipant(
    @Param("id") id: string,
    @Body() dto: UpdateEventParticipantDto
  ) {
    return this.participantsService.updateParticipant(id, dto);
  }

  @Delete(":id")
  async removeParticipant(@Param("id") id: string) {
    return this.participantsService.removeParticipant(id);
  }
}
