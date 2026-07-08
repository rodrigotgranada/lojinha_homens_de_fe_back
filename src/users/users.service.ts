import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneByCpf(cpf: string): Promise<User | null> {
    return this.userModel.findOne({ cpf }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: any): Promise<User> {
    const existingUser = await this.findOneByCpf(createUserDto.cpf);
    if (existingUser) {
      throw new ConflictException(`User with CPF ${createUserDto.cpf} already exists`);
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    if (updateUserDto.cpf) {
      const existingUser = await this.findOneByCpf(updateUserDto.cpf);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException(`CPF ${updateUserDto.cpf} já está cadastrado em outro usuário.`);
      }
    }
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true, returnDocument: 'after' as any })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }
}
