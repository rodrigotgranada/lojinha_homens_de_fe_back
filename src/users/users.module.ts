import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User, UserSchema } from "../schemas/user.schema";
import { EventParticipant, EventParticipantSchema } from "../schemas/event-participant.schema";
import { Sale, SaleSchema } from "../schemas/sale.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EventParticipant.name, schema: EventParticipantSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
