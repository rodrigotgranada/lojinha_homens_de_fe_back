import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(cpf?: string): Promise<import("../schemas/user.schema").User[]>;
    findOne(id: string): Promise<import("../schemas/user.schema").User>;
    create(createUserDto: any): Promise<import("../schemas/user.schema").User>;
    update(id: string, updateUserDto: any): Promise<import("../schemas/user.schema").User>;
}
