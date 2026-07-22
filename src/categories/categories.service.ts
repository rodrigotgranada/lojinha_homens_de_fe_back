import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "../schemas/category.schema";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find({ active: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(name: string): Promise<Category> {
    const formattedName = name.trim();
    let category = await this.categoryModel.findOne({ name: formattedName }).exec();
    if (!category) {
      category = await this.categoryModel.create({ name: formattedName });
    }
    return category;
  }

  async update(id: string, name: string): Promise<Category> {
    const formattedName = name.trim();
    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      { name: formattedName },
      { returnDocument: 'after' as any }
    ).exec();
    if (!updated) {
      throw new Error("Category not found");
    }
    return updated;
  }

  async delete(id: string): Promise<Category> {
    const deleted = await this.categoryModel.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: 'after' as any }
    ).exec();
    if (!deleted) {
      throw new Error("Category not found");
    }
    return deleted;
  }
}
