import { Model } from "mongoose";
import { Category } from "../schemas/category.schema";
export declare class CategoriesService {
    private categoryModel;
    constructor(categoryModel: Model<Category>);
    findAll(): Promise<Category[]>;
    create(name: string): Promise<Category>;
}
