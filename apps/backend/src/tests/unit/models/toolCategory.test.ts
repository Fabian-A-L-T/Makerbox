import Category from "../../../models/ToolCategory";
import { NotFoundError } from "../../../utils/errors";
import type { CategoryData, CategoryFilterData, PaginationData } from "../../../utils/schemas";
import { clearToolCategories, seedData, type TestData } from "../../db/seeder";

const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Test_Category'},
    'Test Subcategory': {id: 0, name: 'Test Subcategory', path: 'Test_Category.Test_Subcategory'},
    'Test Category 2': {id: 0, name: 'Test Category 2', path: 'Test_Category_2'},
    'Test Subcategory 2': {id: 0, name: 'Test Subcategory 2', path: 'Test_Category_2.Test_Subcategory_2'},
    'Delete Category': {id: 0, name: 'Delete Category', path: 'Deleted_Category', deleted_at: Date()}
};

beforeAll(async () => {
    await seedData('tool_categories', categoryData);
});
afterAll(async () => {
    await clearToolCategories();
});

describe('Category get', function() {
    it('returns category data', async () => {
        const data: PaginationData & CategoryFilterData = {limit: 2, offset: 0}
        const res = await Category.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toBeLessThanOrEqual(2);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("path");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates categories', async () => {
        const firstPage = await Category.get({limit: 3, offset: 0});
        const lastPage = await Category.get({limit: 3, offset: 3});

        expect(firstPage).toHaveLength(3);
        expect(lastPage).toHaveLength(1);
    });

    it('orders categories', async () => {
        const ascending = await Category.get({limit: 2, offset: 0, orderBy: 'id'});
        const descending = await Category.get({limit: 2, offset: 0, orderBy: 'id', desc: 'true'});

        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters with search attribute', async () => {
        const category = categoryData['Test Subcategory 2'];
        const data: PaginationData & CategoryFilterData = {limit: 2, offset: 0, search: 'Test Subcategory 2'}
        const res = await Category.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0].id).toEqual(category.id);
        expect(res[0].name).toEqual(category.name);
        expect(res[0].path).toEqual(category.path);
    });

    it('excludes id', async () => {
        const category = categoryData['Test Category'];
        const data: PaginationData & CategoryFilterData = {limit: 2, offset: 0, exclude: category.id.toString()}
        const res = await Category.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res[0].id).not.toEqual(category.id);
    });
});

describe('Category getById', function() {
    it('returns category data', async () => {
        const category = categoryData['Test Category'];
        const res = await Category.getById(category.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0].id).toEqual(category.id);
        expect(res[0].name).toEqual(category.name);
        expect(res[0].path).toEqual(category.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it("throws error if id doesn't exists", async () => {
        await expect(() => Category.getById(123)).rejects.toThrow(NotFoundError);
    });
    it('throws error if id exists but was soft-deleted', async () => {
        const deletedCategory = categoryData['Delete Category'];
        await expect(() => Category.getById(deletedCategory.id)).rejects.toThrow(NotFoundError);
    });
});

describe('Category getChildren', function() {
    it('returns the category and its children by path', async () => {
        const category = categoryData['Test Category'];
        const children = categoryData['Test Subcategory'];
        const res = await Category.getChildren(category.path);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(2);
        expect(res).toEqual(expect.arrayContaining([
            {id: category.id, name: category.name, path: category.path},
            {id: children.id, name: children.name, path: children.path}
        ]));
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it('returns all the root categories if no path is sent', async () => {
        const category1 = categoryData['Test Category'];
        const category2 = categoryData['Test Category 2'];
        const res = await Category.getChildren();

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(2);
        expect(res).toEqual(expect.arrayContaining([
            {id: category1.id, name: category1.name, path: category1.path},
            {id: category2.id, name: category2.name, path: category2.path}
        ]));
    });
    it('returns empty array if category was deleted', async () => {
        const deletedCategory = categoryData['Delete Category'];
        const res = await Category.getChildren(deletedCategory.path);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(0);
    });
    it("returns empty array if category doesn't exists", async () => {
        const res = await Category.getChildren('qwerty');

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(0);
    });
});

describe('Category create', function() {
    it('creates category and return the values', async () => {
        const newCategory = {name: 'New category', path: 'New_category'};
        const res = await Category.create(newCategory);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].name).toEqual(newCategory.name);
        expect(res[0].path).toEqual(newCategory.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it('creates subcategory and return the values', async () => {
        const newCategory = {name: 'New subcategory', path: 'New_category.New_subcategory'};
        const res = await Category.create(newCategory);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].name).toEqual(newCategory.name);
        expect(res[0].path).toEqual(newCategory.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
});

describe('Category update', function() {
    it('updates category and return the values', async () => {
        const category = categoryData['Test Category'];
        const newCategory = {name: 'New name', path: 'New_name'};
        const res = await Category.update(category.id, newCategory);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].name).toEqual(newCategory.name);
        expect(res[0].path).toEqual(newCategory.path);
        expect(res[0].old_path).toEqual(category.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it('updates the children path of the updated parent', async () => {
        const childrenCategory = categoryData['Test Subcategory'];
        const res = await Category.getById(childrenCategory.id);

        expect(res[0].path).toContain("New_name");
    });
    it("throws error if id doesn't exists", async () => {
        const newCategory = {name: 'New name', path: 'New_name'};
        await expect(() => Category.update(123,newCategory)).rejects.toThrow(NotFoundError);
    });
    it('throws error if id exists but is soft-deleted', async () => {
        const deletedCategory = categoryData['Delete Category'];
        const newCategory = {name: 'New name', path: 'New_name'};
        await expect(() => Category.update(deletedCategory.id,newCategory)).rejects.toThrow(NotFoundError);
    });
});

describe('Category delete', function() {
    it('deletes category and return the values', async () => {
        const category = categoryData['Test Category 2'];
        const res = await Category.delete(category.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0].id).toEqual(category.id);
        expect(res[0].name).toEqual(category.name);
        expect(res[0].path).toEqual(category.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it('also deletes the children of the deleted category', async () => {
        const category = categoryData['Test Subcategory 2'];
        await expect(() => Category.getById(category.id)).rejects.toThrow(NotFoundError);
    });
    it("throws error if id doesn't exists", async () => {
        await expect(() => Category.delete(123)).rejects.toThrow(NotFoundError);
    });
    it('throws error if id exists but is soft-deleted', async () => {
        const deletedCategory = categoryData['Delete Category'];
        await expect(() => Category.delete(deletedCategory.id)).rejects.toThrow(NotFoundError);
    });
});

describe('Category restore', function() {
    it('restores category and return the values', async () => {
        const category = categoryData['Test Category 2'];
        const res = await Category.restore(category.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toEqual(1);
        expect(res[0].id).toEqual(category.id);
        expect(res[0].name).toEqual(category.name);
        expect(res[0].path).toEqual(category.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
    it('also restores the children of the restored category', async () => {
        const category = categoryData['Test Subcategory 2'];
        const res = await Category.getById(category.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res[0].id).toEqual(category.id);
        expect(res[0].name).toEqual(category.name);
        expect(res[0].path).toEqual(category.path);
    });
    it("throws error if id doesn't exists", async () => {
        await expect(() => Category.restore(123)).rejects.toThrow(NotFoundError);
    });
    it('throws error if id exists but was not deleted', async () => {
        const category = categoryData['Test Category'];
        await expect(() => Category.restore(category.id)).rejects.toThrow(NotFoundError);
    });
});