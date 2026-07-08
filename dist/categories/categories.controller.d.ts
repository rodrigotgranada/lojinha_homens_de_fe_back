import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("../schemas/category.schema").Category[]>;
    create(name: string): Promise<import("../schemas/category.schema").Category>;
    update(id: string, name: string): Promise<import("../schemas/category.schema").Category>;
    delete(id: string): Promise<import("../schemas/category.schema").Category>;
}
