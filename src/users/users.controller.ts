import { Controller, Get, Post, Patch, Body, Query, Param, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query("cpf") cpf?: string) {
    if (cpf) {
      // json-server compatibility: returns user if found, or empty array or null
      // Let's return single user or null
      const user = await this.usersService.findOneByCpf(cpf);
      return user ? [user] : [];
    }
    return this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }
}
