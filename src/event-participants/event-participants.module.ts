import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventParticipant, EventParticipantSchema } from "../schemas/event-participant.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { EventParticipantsService } from "./event-participants.service";
import { EventParticipantsController } from "./event-participants.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventParticipant.name, schema: EventParticipantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EventParticipantsController],
  providers: [EventParticipantsService],
  exports: [EventParticipantsService],
})
export class EventParticipantsModule {}
