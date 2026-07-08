import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { FirebaseService } from "../firebase/firebase.service";
import { WebsocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private firebaseService: FirebaseService,
    private wsGateway: WebsocketGateway
  ) {}

  private async getOrCreateCategory(name: string): Promise<any> {
    const formattedName = (name || "Outros").trim();
    let category = await this.categoryModel.findOne({ name: formattedName }).exec();
    if (!category) {
      category = await this.categoryModel.create({ name: formattedName });
    }
    return category;
  }

  async findAll(includeInactive = false): Promise<Product[]> {
    const filter = includeInactive ? {} : { active: { $ne: false } };
    return this.productModel.find(filter).populate("categoryRef").exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate("categoryRef").exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: any, file?: Express.Multer.File): Promise<Product> {
    console.log(`[ProductsService] Creating product: "${createProductDto.name}"`);
    const { category, ...rest } = createProductDto;
    const cat = await this.getOrCreateCategory(category);

    const createdProduct = new this.productModel({
      ...rest,
      categoryRef: cat._id,
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

  async update(id: string, updateProductDto: any, file?: Express.Multer.File): Promise<Product> {
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

    const { category, ...rest } = updateProductDto;
    const updateData: any = { ...rest, imageUrl };

    if (category) {
      const cat = await this.getOrCreateCategory(category);
      updateData.categoryRef = cat._id;
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

  async updateStock(id: string, newStock: number): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { stock: newStock }, { new: true, returnDocument: 'after' as any })
      .populate("categoryRef")
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Broadcast change to all websocket clients
    this.wsGateway.broadcastStockChange(id, newStock);
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

    // Broadcast status change to all clients
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

    // Broadcast status change to all clients
    this.wsGateway.broadcastProductStatusChange(id, true);
    this.wsGateway.broadcastProductChange(updatedProduct);

    return updatedProduct;
  }
}
