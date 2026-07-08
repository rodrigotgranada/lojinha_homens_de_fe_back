import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query("all") includeAll?: string) {
    // json-server compat check: json-server fetches all by default
    // We will return both active and inactive if includeAll is true or query matches
    const showAll = includeAll === "true" || includeAll !== undefined;
    return this.productsService.findAll(showAll);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() createProductDto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Parse numeric fields from multipart text data
    const payload = {
      ...createProductDto,
      price: createProductDto.price ? Number(createProductDto.price) : 0,
      stock: createProductDto.stock ? Number(createProductDto.stock) : 0,
      minStock: createProductDto.minStock ? Number(createProductDto.minStock) : 5,
      active: createProductDto.active !== "false",
    };
    return this.productsService.create(payload, file);
  }

  @Put(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const payload = {
      ...updateProductDto,
      price: updateProductDto.price ? Number(updateProductDto.price) : undefined,
      stock: updateProductDto.stock ? Number(updateProductDto.stock) : undefined,
      minStock: updateProductDto.minStock ? Number(updateProductDto.minStock) : undefined,
      active: updateProductDto.active !== undefined ? updateProductDto.active !== "false" : undefined,
    };
    return this.productsService.update(id, payload, file);
  }

  @Patch(":id")
  async patchUpdate(@Param("id") id: string, @Body() body: any) {
    const keys = Object.keys(body);
    if (keys.length === 1 && body.stock !== undefined) {
      return this.productsService.updateStock(id, Number(body.stock));
    }
    return this.productsService.update(id, body);
  }

  @Delete(":id")
  async deactivate(@Param("id") id: string) {
    return this.productsService.deactivate(id);
  }

  @Post(":id/activate")
  async activate(@Param("id") id: string) {
    return this.productsService.activate(id);
  }

  @Post(":id/image")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.productsService.uploadImage(id, file);
  }
}
