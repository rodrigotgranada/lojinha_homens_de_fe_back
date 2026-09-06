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
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from "./dto/product.dto";
import { ImportPreviousStockDto } from "./dto/import-previous-stock.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query("all") includeAll?: string,
    @Query("eventId") eventId?: string
  ) {
    const showAll = includeAll === "true" || includeAll !== undefined;
    return this.productsService.findAll(showAll, eventId);
  }

  @Get("remaining-stock/:eventId")
  async getRemainingStock(@Param("eventId") eventId: string) {
    return this.productsService.getRemainingStockFromEvent(eventId);
  }

  @Post("import-stock-reconciliation")
  async importStockReconciliation(@Body() dto: ImportPreviousStockDto) {
    return this.productsService.importStockReconciliation(dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Put(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Patch(":id")
  async patchUpdate(
    @Param("id") id: string,
    @Body() body: UpdateStockDto | UpdateProductDto
  ) {
    if ("stock" in body && Object.keys(body).length === 1) {
      return this.productsService.updateStock(id, Number(body.stock));
    }
    return this.productsService.update(id, body as UpdateProductDto);
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
