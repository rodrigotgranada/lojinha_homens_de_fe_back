import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  async create(@Body("name") name: string) {
    return this.categoriesService.create(name);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body("name") name: string) {
    return this.categoriesService.update(id, name);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.categoriesService.delete(id);
  }
}
