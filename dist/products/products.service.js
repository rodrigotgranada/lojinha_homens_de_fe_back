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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const firebase_service_1 = require("../firebase/firebase.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const logs_service_1 = require("../logs/logs.service");
const expenses_service_1 = require("../expenses/expenses.service");
let ProductsService = ProductsService_1 = class ProductsService {
    productModel;
    categoryModel;
    firebaseService;
    wsGateway;
    logsService;
    expensesService;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(productModel, categoryModel, firebaseService, wsGateway, logsService, expensesService) {
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.firebaseService = firebaseService;
        this.wsGateway = wsGateway;
        this.logsService = logsService;
        this.expensesService = expensesService;
    }
    async getOrCreateCategory(name) {
        const formattedName = (name || "Outros").trim();
        let category = await this.categoryModel.findOne({ name: formattedName }).exec();
        if (!category) {
            category = await this.categoryModel.create({ name: formattedName });
        }
        return category;
    }
    async findAll(includeInactive = false, eventId) {
        const filter = includeInactive ? {} : { active: { $ne: false } };
        if (eventId && mongoose_2.Types.ObjectId.isValid(eventId)) {
            filter.$or = [
                { eventId: new mongoose_2.Types.ObjectId(eventId) },
                { eventId: null },
                { eventId: { $exists: false } },
            ];
        }
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
        this.logger.log(`Creating product: "${createProductDto.name}"`);
        const { category, eventId, totalCost, sponsorName, sponsorCpf, sponsorPhone, isDonation, ...rest } = createProductDto;
        const cat = await this.getOrCreateCategory(category || "Outros");
        const createdProduct = new this.productModel({
            ...rest,
            totalCost,
            sponsorName,
            sponsorCpf,
            sponsorPhone,
            isDonation,
            categoryRef: cat._id,
            eventId: eventId && mongoose_2.Types.ObjectId.isValid(eventId) ? new mongoose_2.Types.ObjectId(eventId) : undefined,
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
        if ((totalCost && totalCost > 0) || isDonation) {
            if (eventId && mongoose_2.Types.ObjectId.isValid(eventId)) {
                try {
                    const expenses = await this.expensesService.findAll(eventId);
                    let group = expenses.find(e => e.category === "LOJINHA");
                    if (!group) {
                        group = await this.expensesService.create({
                            eventId,
                            title: "Custos da Lojinha - Automático",
                            category: "LOJINHA",
                            nature: "LOJINHA_INVESTIMENTO",
                            description: "Grupo criado automaticamente pelo cadastro de produtos.",
                            operatorName: "Sistema"
                        });
                    }
                    if (group) {
                        await this.expensesService.addItem(group._id.toString(), {
                            description: `Lote de ${rest.name}`,
                            amount: totalCost || 0,
                            paidBy: sponsorName || sponsorCpf || "Desconhecido",
                            payerPhone: sponsorPhone || "",
                            isDonation: isDonation || false,
                            operatorName: "Sistema",
                            notes: `Gerado automaticamente pelo cadastro do produto ${rest.name}`
                        });
                    }
                }
                catch (err) {
                    this.logger.error("Failed to auto-create expense item for product", err);
                }
            }
        }
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
        const { category, eventId, ...rest } = updateProductDto;
        const updateData = { ...rest, imageUrl };
        if (category) {
            const cat = await this.getOrCreateCategory(category);
            updateData.categoryRef = cat._id;
        }
        if (eventId !== undefined) {
            updateData.eventId = eventId && mongoose_2.Types.ObjectId.isValid(eventId) ? new mongoose_2.Types.ObjectId(eventId) : null;
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
            .findByIdAndUpdate(id, { stock: Math.max(0, newStock) }, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        this.wsGateway.broadcastStockChange(id, updatedProduct.stock);
        this.wsGateway.broadcastProductChange(updatedProduct);
        return updatedProduct;
    }
    async incrementStock(id, delta) {
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(id, { $inc: { stock: delta } }, { new: true, returnDocument: 'after' })
            .populate("categoryRef")
            .exec();
        if (!updatedProduct) {
            throw new common_1.NotFoundException(`Produto #${id} não encontrado para alteração de estoque.`);
        }
        this.wsGateway.broadcastStockChange(id, updatedProduct.stock);
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
    async getRemainingStockFromEvent(eventId) {
        if (!eventId || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("ID de evento inválido");
        }
        return this.productModel
            .find({
            eventId: new mongoose_2.Types.ObjectId(eventId),
            stock: { $gt: 0 },
            active: { $ne: false },
        })
            .populate("categoryRef")
            .exec();
    }
    async importStockReconciliation(dto) {
        const { currentEventId, previousEventId, items, operatorName = "Admin" } = dto;
        if (!mongoose_2.Types.ObjectId.isValid(currentEventId) || !mongoose_2.Types.ObjectId.isValid(previousEventId)) {
            throw new common_1.BadRequestException("IDs de evento inválidos");
        }
        const createdProducts = [];
        let importedCount = 0;
        let writtenOffCount = 0;
        for (const item of items) {
            const prevProduct = await this.productModel.findById(item.productId).exec();
            if (!prevProduct)
                continue;
            const importQty = Number(item.quantityToImport) || 0;
            const writeOffQty = Number(item.writeOffQuantity) || 0;
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
                    eventId: new mongoose_2.Types.ObjectId(currentEventId),
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        firebase_service_1.FirebaseService,
        websocket_gateway_1.WebsocketGateway,
        logs_service_1.LogsService,
        expenses_service_1.ExpensesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map