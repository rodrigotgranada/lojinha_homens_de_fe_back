"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParticipantsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const event_participant_schema_1 = require("../schemas/event-participant.schema");
const user_schema_1 = require("../schemas/user.schema");
const event_schema_1 = require("../schemas/event.schema");
const event_participants_service_1 = require("./event-participants.service");
const event_participants_controller_1 = require("./event-participants.controller");
const inscriptions_controller_1 = require("./inscriptions.controller");
let EventParticipantsModule = class EventParticipantsModule {
};
exports.EventParticipantsModule = EventParticipantsModule;
exports.EventParticipantsModule = EventParticipantsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: event_participant_schema_1.EventParticipant.name, schema: event_participant_schema_1.EventParticipantSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: event_schema_1.Event.name, schema: event_schema_1.EventSchema },
            ]),
        ],
        controllers: [event_participants_controller_1.EventParticipantsController, inscriptions_controller_1.InscriptionsController],
        providers: [event_participants_service_1.EventParticipantsService],
        exports: [event_participants_service_1.EventParticipantsService],
    })
], EventParticipantsModule);
//# sourceMappingURL=event-participants.module.js.map