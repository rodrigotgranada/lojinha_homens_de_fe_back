import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(cpf?: string, eventId?: string, all?: string): Promise<any[]>;
    search(query?: string, eventId?: string): Promise<any[]>;
    linkToEvent(userId: string, body: {
        eventId: string;
        type?: "ACAMPANTE" | "TRABALHO";
        operator?: string;
    }): Promise<any>;
    getUserHistory(id: string): Promise<any>;
    findOne(id: string): Promise<import("../schemas/user.schema").User>;
    create(createUserDto: CreateUserDto): Promise<import("../schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../schemas/user.schema").User>;
    markCharged(id: string): Promise<import("../schemas/user.schema").User>;
}
