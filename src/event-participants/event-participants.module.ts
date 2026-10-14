import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventParticipant, EventParticipantSchema } from "../schemas/event-participant.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { Event, EventSchema } from "../schemas/event.schema";
import { EventParticipantsService } from "./event-participants.service";
import { EventParticipantsController } from "./event-participants.controller";
import { InscriptionsController } from "./inscriptions.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventParticipant.name, schema: EventParticipantSchema },
      { name: User.name, schema: UserSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [EventParticipantsController, InscriptionsController],
  providers: [EventParticipantsService],
  exports: [EventParticipantsService],
})
export class EventParticipantsModule {}
