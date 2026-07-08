"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const firebase_service_1 = require("../firebase/firebase.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let ProductsService = class ProductsService {
    productModel;
    categoryModel;
    firebaseService;
    wsGateway;
    constructor(productModel, categoryModel, firebaseService, wsGateway) {
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.firebaseService = firebaseService;
        this.wsGateway = wsGateway;
    }
    async getOrCreateCategory(name) {
        const formattedName = (name || "Outros").trim();
        let category = await this.categoryModel.findOne({ name: formattedName }).exec();
        if (!category) {
            category = await this.categoryModel.create({ name: formattedName });
        }
        return category;
    }
    async findAll(includeInactive = false) {
        const filter = includeInactive ? {} : { active: { $ne: false } };
        return this.productModel.find(filter).populate("categoryRef").exec();
    }
    async findOne(id) {
        const product = await this.productModel.findById(id).populate("categoryRef").exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async create(createProductDto, file) {
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
    async update(id, updateProductDto, file) {
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
        const updateData = { ...rest, imageUrl };
        if (category) {
            const cat = await this.getOrCreateCategory(category);
            updateData.categoryRef = cat._id;
        }
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(id, updateData, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (updateProductDto.stock !== undefined) {
            this.wsGateway.broadcastStockChange(id, Number(updateProductDto.stock));
        }
        if (updateProductDto.active !== undefined) {
            this.wsGateway.broadcastProductStatusChange(id, !!updateProductDto.active);
        }
        this.wsGateway.broadcastProductChange(updatedProduct);
        return updatedProduct;
    }
    async uploadImage(id, file) {
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
    async updateStock(id, newStock) {
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(id, { stock: newStock }, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        this.wsGateway.broadcastStockChange(id, newStock);
        this.wsGateway.broadcastProductChange(updatedProduct);
        return updatedProduct;
    }
    async deactivate(id) {
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(id, { active: false }, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        this.wsGateway.broadcastProductStatusChange(id, false);
        this.wsGateway.broadcastProductChange(updatedProduct);
        return updatedProduct;
    }
    async activate(id) {
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(id, { active: true }, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        this.wsGateway.broadcastProductStatusChange(id, true);
        this.wsGateway.broadcastProductChange(updatedProduct);
        return updatedProduct;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        firebase_service_1.FirebaseService,
        websocket_gateway_1.WebsocketGateway])
], ProductsService);
//# sourceMappingURL=products.service.js.map