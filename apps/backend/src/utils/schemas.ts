import * as v from 'valibot';

// Pagination ----------------------------------------
export type PaginationData = {
    limit: number;
    offset: number;
}
export const paginationSchema = v.object({
    limit: v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100)),50),
    offset: v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0)),0),
})
//----------------------------------------------------

// Filters -------------------------------------------
export type FilterData = {
    search?: string | undefined;
    orderBy?: "id" | "name" | "created_at" | undefined;
    desc?: string | undefined;
}
export const filterSchema = v.object({
    search: v.optional(v.string()),
    orderBy: v.optional(v.fallback(v.picklist(['id','name', 'created_at']), 'id')),
    desc: v.optional(v.string()),
});

export const categoryFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type CategoryFilterData = v.InferOutput<typeof categoryFilterSchema>;

export const componentFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['name', 'stock', 'created_at']), 'name')),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
});
export type ComponentFilterData = v.InferOutput<typeof componentFilterSchema>;

export const manufacturerFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type ManufacturerFilterData = v.InferOutput<typeof manufacturerFilterSchema>;

export const toolFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['id', 'name', 'created_at']), 'name')),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    state: v.optional(v.picklist(['available', 'in_use', 'maintenance', 'disposed', 'lent']))
});
export type ToolFilterData = v.InferOutput<typeof toolFilterSchema>;

export const locationFilterSchema = v.object({
    ...filterSchema.entries,
    exclude: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.toString())),
});
export type LocationFilterData = v.InferOutput<typeof locationFilterSchema>;

export const movementFilterSchema = v.object({
    ...filterSchema.entries,
    orderBy: v.optional(v.fallback(v.picklist(['created_at']), 'created_at')),
});
export type MovementFilterData = v.InferOutput<typeof movementFilterSchema>;

export const projectFilterSchema = v.object({
    ...filterSchema.entries,
    state: v.optional(v.picklist(['planning', 'active', 'paused', 'completed', 'cancelled'])),
    orderBy: v.optional(v.picklist(['id', 'name', 'created_at', 'budget']))
});
export type ProjectFilterData = v.InferOutput<typeof projectFilterSchema>;
//----------------------------------------------------

// Component and tool categories ------------------------------
export type CategoryData = {
    name: string;
    path: string;
}
export const categorySchema = v.object({
    name: v.string(),
    path: v.string(),
});
//----------------------------------------------------

// Components ----------------------------------------
export type ComponentData = {
    sku: string;
    name: string;
    description?: string | null;
    category_id: number;
    manufacturer_id: number;
    stock?: number;
    stock_min?: number;
    unit_cost?: number;
    datasheet_url?: string | null;
    image_url?: string | null;
    notes?: string | null;
}
export type ComponentListData = {
    id: number;
    selectedStock: number;
}
export const componentSchema = v.object({
    sku: v.string(),
    name: v.string(),
    description: v.nullish(v.string(), null),
    category_id: v.pipe(v.string(), v.toNumber()),
    manufacturer_id: v.pipe(v.string(), v.toNumber()),
    stock: v.optional(v.pipe(v.string(), v.toNumber())),
    stock_min: v.optional(v.pipe(v.string(), v.toNumber())),
    unit_cost: v.optional(v.pipe(v.string(), v.toNumber())),
    datasheet_url: v.nullish(v.string(), null),
    image_url: v.nullish(v.string(), null),
    notes: v.nullish(v.string(), null),
});
export const componentListSchema = v.object({
    id: v.number(), 
    selectedStock: v.pipe(v.number(), v.minValue(1), v.maxValue(50))
});
//----------------------------------------------------

// Manufacturers -------------------------------------
export type ManufacturerData = {
    name: string;
    website?: string | null;
}
export const manufacturerSchema = v.object({
    name: v.string(),
    website: v.nullish(v.string(), null)
});
//----------------------------------------------------

// Tools----------------------------------------------
export type ToolData = {
    sku: string;
    name: string;
    manufacturer_id: number;
    model: string;
    serial_number?: string | null;
    image_url?: string | null;
    manual_url?: string | null;
    category_id: number;
    location_id: number;
    state: "available" | "in_use" | "maintenance" | "disposed" | "lent";
    acquisition_date?: string;
    description?: string | null;
    notes?: string | null;
}
export const toolSchema = v.object({
    sku: v.string(),
    name: v.string(),
    manufacturer_id: v.pipe(v.string(), v.toNumber()),
    model: v.string(),
    serial_number: v.nullish(v.string(), null),
    image_url: v.nullish(v.string(), null),
    manual_url: v.nullish(v.string(), null),
    category_id: v.pipe(v.string(), v.toNumber()),
    location_id: v.pipe(v.string(), v.toNumber()),
    state: v.picklist(['available', 'in_use', 'maintenance', 'disposed', 'lent']),
    acquisition_date: v.optional(v.string()),
    description: v.nullish(v.string(), null),
    notes: v.nullish(v.string(), null)
});
//----------------------------------------------------

// Location ------------------------------------------
export type LocationData = {
    name: string;
    description?: string | null;
    path: string;
}
export type ComponentLocationData = {
    component_id: number;
    location_id: number;
    amount: number;
}
export const locationSchema = v.object({
    name: v.string(),
    description: v.nullish(v.string(), null),
    path: v.string(),
});
//----------------------------------------------------

// Users ---------------------------------------------
export type UserData = {
    name: string;
    passwd: string;
    email: string;
    role?: "admin" | "technician" | "reader" | undefined;
}
export const userSchema = v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
    passwd: v.pipe(v.string(), v.minLength(8), v.maxLength(64)),
    email: v.pipe(v.string(), v.toLowerCase(), v.normalize('NFKC'), v.email()),
    role: v.optional(v.picklist(['admin', 'technician', 'reader'])),
});

export const userRoleSchema = v.object({
    role: v.picklist(['admin', 'technician', 'reader'])
});
export type UserRole = v.InferOutput<typeof userRoleSchema>;
export const userLoginSchema = v.omit(userSchema, ['name','role']);
export type UserLoginData = v.InferOutput<typeof userLoginSchema>;
export const userUpdateSchema = v.omit(userSchema, ['role', 'passwd']);
export type UserUpdateData = v.InferOutput<typeof userUpdateSchema>;
export const userUpdatePasswdSchema = v.object({
    ...v.pick(userSchema, ['passwd']).entries,
    new_passwd: v.pipe(v.string(), v.minLength(8), v.maxLength(64)),
});
export type UserUpdatePasswdData = v.InferOutput<typeof userUpdatePasswdSchema>;
export const userShow = ["id", "name", "email", "role"];
//----------------------------------------------------

// Refresh Tokens ------------------------------------
export type RefreshTokenData = {
    user_id: number;
    token_hash: string;
    remember: boolean;
    user_agent: string;
    ip_address: string;
    expires_at: Date;
}
export const refreshTokenSchema = v.object({
    user_id: v.pipe(v.string(), v.toNumber()),
    token_hash: v.pipe(v.string(), v.length(64)),
    remember: v.boolean(),
    user_agent: v.string(),
    ip_address: v.string(),
    expires_at: v.date()
});
//----------------------------------------------------

// Movements -----------------------------------------
export type MovementData = {
    component_id: number;
    stock_type: "entry" | "reserve" | "return" | "transfer" | "disposal";
    amount: number;
    origin_location_id?: number | null;
    destination_location_id?: number | null;
    project_id?: number | null;
    user_id: number;
    notes?: string | null;
}
export const movementSchema = v.object({
    component_id: v.pipe(v.string(), v.toNumber()),
    stock_type: v.picklist(['entry', 'reserve', 'return', 'transfer', 'disposal']),
    amount: v.pipe(v.string(), v.toNumber()),
    origin_location_id: v.nullish(v.pipe(v.string(), v.toNumber()),null),
    destination_location_id: v.nullish(v.pipe(v.string(), v.toNumber()),null),
    project_id: v.nullish(v.pipe(v.string(), v.toNumber()),null),
    user_id: v.pipe(v.string(), v.toNumber()),
    notes: v.nullish(v.string(), null)
});
//----------------------------------------------------

// Projects -----------------------------------------
export type ProjectData = {
    name: string;
    description?: string | null;
    responsible_id: number;
    start_date: string;
    end_date_real?: string | null;
    budget?: number;
    image_url?: string | null;
    repository_url?: string | null;
}
export const projectSchema = v.object({
    name: v.string(),
    description: v.nullish(v.string(), null),
    responsible_id: v.pipe(v.string(), v.toNumber()),
    start_date: v.string(),
    end_date_real: v.optional(v.string()),
    budget: v.optional(v.pipe(v.string(), v.toNumber(), v.minValue(0), v.maxValue(999999999))),
    image_url: v.nullish(v.string(), null),
    repository_url: v.nullish(v.string(), null)
});
//---------------------------------------------------

// Project milestones -------------------------------
export type MilestoneData = {
    project_id: number;
    title: string;
    description?: string | null;
    is_completed?: boolean;
    completed_at?: string;
    order_index: number;
}
export type MilestoneListData = {
    title: string;
    description: string | null;
}
export const milestoneSchema = v.object({
    project_id: v.number(),
    title: v.pipe(v.string(), v.maxLength(64)),
    description: v.nullish(v.pipe(v.string(), v.maxLength(500)), null),
    is_completed: v.optional(v.boolean()),
    completed_at: v.optional(v.string()),
    order_index: v.pipe(v.string(), v.toNumber(), v.minValue(0), v.maxValue(20))
});
export const milestoneListSchema = v.object({
    title: v.pipe(v.string(), v.maxLength(64)),
    description: v.nullish(v.pipe(v.string(), v.maxLength(500)), null)
});
//---------------------------------------------------

// Project tools ------------------------------------
export type ProjectToolData = {
    project_id: number;
    tool_id: number;
    loan_date?: Date | undefined;
    return_date?: Date | undefined;
    user_id: number;
}
export const projectToolSchema = v.object({
    project_id: v.number(),
    tool_id: v.number(),
    loan_date: v.optional(v.date()),
    return_date: v.optional(v.date()),
    user_id: v.number()
});
//---------------------------------------------------

// Project components -------------------------------
export type ProjectComponentData = {
    project_id: number;
    component_id: number;
    planned_amount: number;
    used_amount: number;
    notes?: string | null;
}
export const projectComponentSchema = v.object({
    project_id: v.number(),
    component_id: v.number(),
    planned_amount: v.number(),
    used_amount: v.number(),
    notes: v.nullish(v.string(), null)
});
//---------------------------------------------------
