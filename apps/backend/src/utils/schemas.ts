import * as v from 'valibot';

// Pagination ----------------------------------------
export const paginationSchema = v.object({
    limit: v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100)),50),
    offset: v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0)),0),
})
export type PaginationData = v.InferOutput<typeof paginationSchema>;
//----------------------------------------------------

// Filters -------------------------------------------
export const filterSchema = v.object({
    search: v.optional(v.string()),
    orderBy: v.optional(v.fallback(v.picklist(['id','name', 'created_at']), 'id')),
    desc: v.optional(v.string()),
});
export type FilterData = v.InferOutput<typeof filterSchema>;
//----------------------------------------------------

// Component categories ------------------------------
export const categoryFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type CategoryFilterData = v.InferOutput<typeof categoryFilterSchema>;

export const categorySchema = v.object({
    name: v.string(),
    path: v.string(),
});
export type CategoryData = v.InferOutput<typeof categorySchema>;
//----------------------------------------------------

// Components ----------------------------------------
export const componentFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['name', 'stock', 'created_at']), 'name')),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
});
export type ComponentFilterData = v.InferOutput<typeof componentFilterSchema>;

export const componentSchema = v.object({
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category_id: v.pipe(v.string(), v.toNumber()),
    manufacturer_id: v.pipe(v.string(), v.toNumber()),
    stock: v.optional(v.pipe(v.string(), v.toNumber())),
    stock_min: v.optional(v.pipe(v.string(), v.toNumber())),
    datasheet_url: v.optional(v.string()),
    image_url: v.optional(v.string()),
    notes: v.optional(v.string()),
});
export type ComponentData = v.InferOutput<typeof componentSchema>;
export const componentShow = ["id", "sku", "name", "description", "category_id", "manufacturer_id", "stock", "stock_min", "datasheet_url", "image_url", "notes"];
//----------------------------------------------------

// Manufacturers -------------------------------------
export const manufacturerFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type ManufacturerFilterData = v.InferOutput<typeof manufacturerFilterSchema>;

export const manufacturerSchema = v.object({
    name: v.string(),
    website: v.optional(v.string())
});
export type ManufacturerData = v.InferOutput<typeof manufacturerSchema>;
//----------------------------------------------------

// Tools----------------------------------------------
export const toolFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['name', 'created_at']), 'name')),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    state: v.optional(v.picklist(['available', 'in_use', 'maintenance', 'disposed', 'lent']))
});
export type ToolFilterData = v.InferOutput<typeof toolFilterSchema>;

const toolStaus = ['available', 'in_use', 'maintenance', 'disposed', 'lent'] as const;
export const toolSchema = v.object({
    sku: v.string(),
    name: v.string(),
    manufacturer_id: v.pipe(v.string(), v.toNumber()),
    model: v.string(),
    serial_number: v.optional(v.string()),
    image_url: v.optional(v.string()),
    manual_url: v.optional(v.string()),
    category_id: v.pipe(v.string(), v.toNumber()),
    location_id: v.pipe(v.string(), v.toNumber()),
    state: v.picklist(toolStaus),
    acquisition_date: v.optional(v.string()),
    calibration_required: v.optional(v.boolean()),
    next_calibration_date: v.optional(v.string()),
    notes: v.optional(v.string())
});
export type ToolData = v.InferOutput<typeof toolSchema>;
export const toolShow = ["id", "sku", "name", "manufacturer_id", "model", "serial_number", "image_url", "manual_url", "category_id", "location_id", "state", "acquisition_date", "calibration_required", "next_calibration_date", "notes", "active"];
//----------------------------------------------------

// Location ------------------------------------------
export const locationFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type LocationFilterData = v.InferOutput<typeof locationFilterSchema>;

export const locationSchema = v.object({
    name: v.string(),
    description: v.optional(v.string()),
    path: v.string(),
});
export type LocationData = v.InferOutput<typeof locationSchema>;
//----------------------------------------------------

// Users ---------------------------------------------
export const userSchema = v.object({
    name: v.string(),
    passwd: v.pipe(v.string(), v.minLength(8), v.maxLength(64)),
    email: v.pipe(v.string(), v.email()),
    role: v.optional(v.picklist(['admin', 'technician', 'reader'])),
});
export type UserData = v.InferOutput<typeof userSchema>;
export const userLoginSchema = v.omit(userSchema, ['name','role']);
export type UserLoginData = v.InferOutput<typeof userLoginSchema>;
export const userRegisterSchema = v.omit(userSchema, ['role']);
export type UserRegisterData = v.InferOutput<typeof userRegisterSchema>;
export const userShow = ["id", "name", "email", "role"];
//----------------------------------------------------

// Movements -----------------------------------------
export const movementFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['created_at']), 'created_at')),
});
export type MovementFilterData = v.InferOutput<typeof movementFilterSchema>;

export const movementSchema = v.object({
    component_id: v.pipe(v.string(), v.toNumber()),
    stock_type: v.picklist(['entry', 'reserve', 'return', 'transfer', 'disposal']),
    amount: v.pipe(v.string(), v.toNumber()),
    origin_location_id: v.optional(v.pipe(v.string(), v.toNumber())),
    destination_location_id: v.optional(v.pipe(v.string(), v.toNumber())),
    project_id: v.optional(v.pipe(v.string(), v.toNumber())),
    user_id: v.pipe(v.string(), v.toNumber()),
    notes: v.optional(v.string())
});
export type MovementData = v.InferOutput<typeof movementSchema>;
//----------------------------------------------------

// Projects -----------------------------------------
export const projectFilterSchema = v.object({
    ...filterSchema.entries,
    state: v.optional(v.picklist(['', 'planning', 'active', 'paused', 'completed', 'cancelled'])),
    orderBy: v.optional(v.picklist(['id', 'name', 'created_at', 'budget'])),
    userId: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0), v.toString())),
});
export type ProjectFilterData = v.InferOutput<typeof projectFilterSchema>;

export const projectSchema = v.object({
    name: v.string(),
    description: v.optional(v.string()),
    state: v.picklist(['planning', 'active', 'paused', 'completed', 'cancelled']),
    responsible_id: v.optional(v.pipe(v.string(), v.toNumber())),
    start_date: v.string(),
    end_date_estimated: v.optional(v.string()),
    end_date_real: v.optional(v.string()),
    budget: v.optional(v.pipe(v.string(), v.toNumber(), v.minValue(0), v.maxValue(999999999999))),
    image_url: v.optional(v.string()),
    repository_url: v.optional(v.string())
});
export type ProjectData = v.InferOutput<typeof projectSchema>;
//---------------------------------------------------

// Project tools ------------------------------------
export const projectToolSchema = v.object({
    project_id: v.number(),
    tool_id: v.number(),
    loan_date: v.optional(v.date()),
    return_date: v.optional(v.date()),
    user_id: v.number()
});
export type ProjectToolData = v.InferOutput<typeof projectToolSchema>;
//---------------------------------------------------

// Project components -------------------------------
export const projectComponentSchema = v.object({
    project_id: v.number(),
    component_id: v.number(),
    planned_quantity: v.number(),
    used_quantity: v.number(),
    notes: v.optional(v.string())
});
export type ProjectComponentData = v.InferOutput<typeof projectComponentSchema>;
//---------------------------------------------------
