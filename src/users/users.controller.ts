import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query("cpf") cpf?: string,
    @Query("eventId") eventId?: string,
    @Query("all") all?: string
  ) {
    if (cpf) {
      const user = await this.usersService.findOneByCpf(cpf);
      return user ? [user] : [];
    }

    if (eventId && all !== "true") {
      return this.usersService.findByEvent(eventId);
    }

    return this.usersService.findAll();
  }

  @Get("search")
  async search(
    @Query("q") query: string = "",
    @Query("eventId") eventId?: string
  ) {
    return this.usersService.searchUsers(query, eventId);
  }

  @Post(":id/link-event")
  async linkToEvent(
    @Param("id") userId: string,
    @Body() body: { eventId: string; type?: "ACAMPANTE" | "TRABALHO"; operator?: string }
  ) {
    return this.usersService.linkToEvent(
      userId,
      body.eventId,
      body.type || "ACAMPANTE",
      body.operator || "PDV"
    );
  }

  @Get(":id/history")
  async getUserHistory(@Param("id") id: string) {
    return this.usersService.getUserFullHistory(id);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/charged")
  async markCharged(@Param("id") id: string) {
    return this.usersService.markCharged(id);
  }
}
