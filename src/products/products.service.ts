import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { FirebaseService } from "../firebase/firebase.service";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { LogsService } from "../logs/logs.service";
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from "./dto/product.dto";
import { ImportPreviousStockDto } from "./dto/import-previous-stock.dto";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private firebaseService: FirebaseService,
    private wsGateway: WebsocketGateway,
    private logsService: LogsService
  ) {}

  private async getOrCreateCategory(name: string): Promise<any> {
    const formattedName = (name || "Outros").trim();
    let category = await this.categoryModel.findOne({ name: formattedName }).exec();
    if (!category) {
      category = await this.categoryModel.create({ name: formattedName });
    }
    return category;
  }

  async findAll(includeInactive = false, eventId?: string): Promise<Product[]> {
    const filter: any = includeInactive ? {} : { active: { $ne: false } };
    if (eventId && Types.ObjectId.isValid(eventId)) {
      filter.$or = [
        { eventId: new Types.ObjectId(eventId) },
        { eventId: null },
        { eventId: { $exists: false } },
      ];
    }
    return this.productModel.find(filter).populate("categoryRef").exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate("categoryRef").exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
    this.logger.log(`Creating product: "${createProductDto.name}"`);
    const { category, eventId, ...rest } = createProductDto;
    const cat = await this.getOrCreateCategory(category || "Outros");

    const createdProduct = new this.productModel({
      ...rest,
      categoryRef: cat._id,
      eventId: eventId && Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : undefined,
      imageUrl: rest.imageUrl || "",
    });
    const saved = await createdProduct.save();
    console.log(`[ProductsService] Product created with ID: ${saved.id}`);

    if (file) {
      console.log(`[ProductsService] Direct file upload detected during creation. Uploading...`);
      const imageUrl = await this.firebaseService.uploadFile(file, `item/${saved.id}`);
      console.log(`[ProductsService] Image uploaded to: ${imageUrl}`);
      await this.productModel.findByIdAndUpdate(saved.id, { imageUrl }).exec();
    }

    const populatedProduct = await this.findOne(saved.id);
    this.wsGateway.broadcastProductChange(populatedProduct);
    return populatedProduct;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<Product> {
    console.log(`[ProductsService] Updating product ${id}`);
    const product = await this.findOne(id);
    let imageUrl = updateProductDto.imageUrl !== undefined ? updateProductDto.imageUrl : product.imageUrl;

    if (file) {
      console.log(`[ProductsService] Direct file upload detected during update. Uploading...`);
      if (product.imageUrl) {
        console.log(`[ProductsService] Deleting old image: ${product.imageUrl}`);
        await this.firebaseService.deleteFile(product.imageUrl);
      }
      imageUrl = await this.firebaseService.uploadFile(file, `item/${id}`);
      console.log(`[ProductsService] Image uploaded to: ${imageUrl}`);
    }

    const { category, eventId, ...rest } = updateProductDto;
    const updateData: any = { ...rest, imageUrl };

    if (category) {
      const cat = await this.getOrCreateCategory(category);
      updateData.categoryRef = cat._id;
    }

    if (eventId !== undefined) {
      updateData.eventId = eventId && Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : null;
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true, returnDocument: 'after' as any })
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Broadcast stock change if it was changed in edit modal
    if (updateProductDto.stock !== undefined) {
      this.wsGateway.broadcastStockChange(id, Number(updateProductDto.stock));
    }

    // Broadcast status change if active was updated
    if (updateProductDto.active !== undefined) {
      this.wsGateway.broadcastProductStatusChange(id, !!updateProductDto.active);
    }

    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<{ url: string }> {
    console.log(`[ProductsService] Uploading image for product ${id}`);
    const product = await this.findOne(id);

    if (product.imageUrl) {
      console.log(`[ProductsService] Deleting old image: ${product.imageUrl}`);
      await this.firebaseService.deleteFile(product.imageUrl);
    }

    const imageUrl = await this.firebaseService.uploadFile(file, `item/${id}`);
    console.log(`[ProductsService] Image uploaded to: ${imageUrl}`);

    product.imageUrl = imageUrl;
    await product.save();

    const populatedProduct = await this.findOne(id);
    this.wsGateway.broadcastProductChange(populatedProduct);

    return { url: imageUrl };
  }

  // Operação atômica direta com $set
  async updateStock(id: string, newStock: number): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { stock: Math.max(0, newStock) }, { new: true, returnDocument: 'after' as any })
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.wsGateway.broadcastStockChange(id, updatedProduct.stock);
    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }

  // Operação atômica incremental ($inc) para vendas e estornos com proteção de concorrência
  async incrementStock(id: string, delta: number): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stock: delta } },
        { new: true, returnDocument: 'after' as any }
      )
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Produto #${id} não encontrado para alteração de estoque.`);
    }

    this.wsGateway.broadcastStockChange(id, updatedProduct.stock);
    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }

  async deactivate(id: string): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { active: false }, { new: true, returnDocument: 'after' as any })
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.wsGateway.broadcastProductStatusChange(id, false);
    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }

  async activate(id: string): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { active: true }, { new: true, returnDocument: 'after' as any })
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.wsGateway.broadcastProductStatusChange(id, true);
    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }

  // =========================================================================
  // MÓDULO DE IMPORTAÇÃO E CONCILIAÇÃO DE SOBRAS DE ESTOQUE ENTRE EVENTOS
  // =========================================================================
  async getRemainingStockFromEvent(eventId: string): Promise<Product[]> {
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("ID de evento inválido");
    }

    return this.productModel
      .find({
        eventId: new Types.ObjectId(eventId),
        stock: { $gt: 0 },
        active: { $ne: false },
      })
      .populate("categoryRef")
      .exec();
  }

  async importStockReconciliation(dto: ImportPreviousStockDto): Promise<{
    importedCount: number;
    writtenOffCount: number;
    createdProducts: Product[];
  }> {
    const { currentEventId, previousEventId, items, operatorName = "Admin" } = dto;

    if (!Types.ObjectId.isValid(currentEventId) || !Types.ObjectId.isValid(previousEventId)) {
      throw new BadRequestException("IDs de evento inválidos");
    }

    const createdProducts: Product[] = [];
    let importedCount = 0;
    let writtenOffCount = 0;

    for (const item of items) {
      const prevProduct = await this.productModel.findById(item.productId).exec();
      if (!prevProduct) continue;

      const importQty = Number(item.quantityToImport) || 0;
      const writeOffQty = Number(item.writeOffQuantity) || 0;

      // 1. Criar o produto novo no evento atual com a quantidade importada
      if (importQty > 0) {
        const newProduct = new this.productModel({
          name: prevProduct.name,
          price: prevProduct.price,
          stock: importQty,
          initialStock: importQty,
          importedFrom: prevProduct._id,
          imageUrl: prevProduct.imageUrl || "",
          active: true,
          categoryRef: prevProduct.categoryRef,
          eventId: new Types.ObjectId(currentEventId),
          minStock: prevProduct.minStock || 5,
        });

        const saved = await newProduct.save();
        createdProducts.push(saved);
        importedCount += 1;

        await this.logsService.create({
          userId: "system",
          userName: operatorName,
          action: "product_stock_import",
          description: `Importou sobra de estoque de ${importQty} un. do produto "${prevProduct.name}" da edição anterior para a edição atual`,
          metadata: {
            previousProductId: prevProduct.id,
            newProductId: saved.id,
            quantity: importQty,
            currentEventId,
            previousEventId,
          },
        });
      }

      // 2. Registrar baixa/perda no produto anterior se houver itens baixados
      if (writeOffQty > 0) {
        writtenOffCount += 1;
        await this.logsService.create({
          userId: "system",
          userName: operatorName,
          action: "product_stock_write_off",
          description: `Registrou baixa de sobra (${item.writeOffReason || "PERDA"}: ${writeOffQty} un.) no produto "${prevProduct.name}" do evento anterior. Obs: ${item.writeOffNotes || "Sem observações"}`,
          metadata: {
            productId: prevProduct.id,
            writeOffQuantity: writeOffQty,
            reason: item.writeOffReason || "PERDA",
            notes: item.writeOffNotes || "",
            eventId: previousEventId,
          },
        });
      }

      // 3. Zerar o estoque remanescente do produto no evento anterior para encerrar sua pendência
      prevProduct.stock = 0;
      await prevProduct.save();
      this.wsGateway.broadcastStockChange(prevProduct.id, 0);
    }

    return {
      importedCount,
      writtenOffCount,
      createdProducts,
    };
  }
}
