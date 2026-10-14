import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { EventParticipant } from "../schemas/event-participant.schema";
import { Sale } from "../schemas/sale.schema";
export declare class UsersService {
    private userModel;
    private participantModel;
    private saleModel;
    constructor(userModel: Model<User>, participantModel: Model<EventParticipant>, saleModel: Model<Sale>);
    findAll(): Promise<User[]>;
    findByEvent(eventId: string): Promise<any[]>;
    searchUsers(query: string, eventId?: string): Promise<any[]>;
    linkToEvent(userId: string, eventId: string, type?: "ACAMPANTE" | "TRABALHO", operatorName?: string): Promise<any>;
    findOneByCpf(cpf: string): Promise<User | null>;
    findOne(id: string): Promise<User>;
    create(createUserDto: any): Promise<User>;
    update(id: string, updateUserDto: any): Promise<User>;
    markCharged(id: string): Promise<User>;
    getUserFullHistory(userId: string): Promise<any>;
}
