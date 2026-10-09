import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(cpf?: string): Promise<import("../schemas/user.schema").User[]>;
    findOne(id: string): Promise<import("../schemas/user.schema").User>;
    create(createUserDto: CreateUserDto): Promise<import("../schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../schemas/user.schema").User>;
}
