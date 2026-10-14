export declare class CreateUserDto {
    cpf: string;
    email?: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: string;
    active?: boolean;
    createdBy?: string;
}
export declare class UpdateUserDto {
    cpf?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    active?: boolean;
    createdBy?: string;
}
