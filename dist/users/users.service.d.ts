import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findAll(): Promise<User[]>;
    findOneByCpf(cpf: string): Promise<User | null>;
    findOne(id: string): Promise<User>;
    create(createUserDto: any): Promise<User>;
    update(id: string, updateUserDto: any): Promise<User>;
}
