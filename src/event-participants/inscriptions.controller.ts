import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { EventParticipantsService } from "./event-participants.service";
import { PublicInscriptionDto } from "./dto/public-inscription.dto";

@Controller("inscriptions")
export class InscriptionsController {
  constructor(
    private readonly participantsService: EventParticipantsService
  ) {}

  @Get("active-event")
  async getActiveEvent() {
    const event = await this.participantsService.getActiveEvent();
    if (!event) {
      return null;
    }
    return {
      id: event._id.toString(),
      name: event.name,
      slug: (event as any).slug,
      city: (event as any).city,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      isActive: event.isActive,
    };
  }

  @Get("event-by-slug/:slug")
  async getEventBySlug(@Param("slug") slug: string) {
    const event = await this.participantsService.getEventBySlug(slug);
    if (!event) {
      return null;
    }
    return {
      id: event._id.toString(),
      name: event.name,
      slug: (event as any).slug,
      city: (event as any).city,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      isActive: event.isActive,
    };
  }

  @Post("public")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitPublicInscription(@Body() dto: PublicInscriptionDto) {
    return this.participantsService.submitPublicInscription(dto);
  }

  @Get()
  async findAllInscriptions(
    @Query("eventId") eventId?: string,
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("search") search?: string
  ) {
    return this.participantsService.findAllInscriptions({
      eventId,
      status,
      type,
      search,
    });
  }

  @Patch(":id/confirm")
  async confirmParticipant(
    @Param("id") id: string,
    @Query("operator") operator?: string
  ) {
    return this.participantsService.confirmParticipant(id, operator || "Admin");
  }

  @Patch(":id/cancel")
  async cancelParticipant(
    @Param("id") id: string,
    @Query("operator") operator?: string
  ) {
    return this.participantsService.cancelParticipant(id, operator || "Admin");
  }

  @Patch(":id/type")
  async updateParticipantType(
    @Param("id") id: string,
    @Body("type") type: "ACAMPANTE" | "TRABALHO"
  ) {
    return this.participantsService.updateParticipant(id, { type });
  }
}
