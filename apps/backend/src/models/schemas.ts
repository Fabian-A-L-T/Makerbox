import * as v from 'valibot';

export const NumberSchema = v.pipe(v.string(), v.toNumber(), v.number());

export const UserLoginSchema = v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email()),
    passwd: v.string()
});

enum UserRole {
    admin = 'admin',
    technician = 'technician',
    reader = 'reader'
}

const UserSchema = v.object({
    id: v.number(),
    name: v.string(),
    passwd: v.string(),
    email: v.pipe(v.string(), v.email()),
    role: v.optional(v.enum(UserRole)),
    active: v.optional(v.boolean()),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const userShow = ["id", "name", "email", "role"];
export const UserCreate = v.omit(UserSchema, ['id', 'active', 'created_at', 'updated_at', 'deleted_at']);
export type UserCreateData = v.InferOutput<typeof UserCreate>;
export const UserEmail = v.pipe(v.string(), v.email());
export type UserEmailData = v.InferOutput<typeof UserEmail>;
export const UserPassword = v.pipe(v.string(), v.minLength(8), v.maxLength(64));
export type UserPasswordData = v.InferOutput<typeof UserPassword>;
export const UserUpdate = v.partial(v.pick(UserSchema, ['name', 'email', 'role']));
export type UserUpdateData = v.InferOutput<typeof UserUpdate>;

const CategorySchema = v.object({
    id: v.number(),
    name: v.string(),
    path: v.string(),
});
export const CategoryCreate = v.omit(CategorySchema, ['id']);
export type CategoryCreateData = v.InferOutput<typeof CategoryCreate>;

const ComponentSchema = v.object({
    id: v.number(),
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category_id: v.pipe(v.string(), v.toNumber()),
    manufacturer_id: v.pipe(v.string(), v.toNumber()),
    stock: v.pipe(v.string(), v.toNumber()),
    stock_min: v.pipe(v.string(), v.toNumber()),
    metric: v.optional(v.string()),
    datasheet_url: v.optional(v.string()),
    image_url: v.optional(v.string()),
    notes: v.optional(v.string()),
    active: v.optional(v.boolean()),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const ComponentCreate = v.omit(ComponentSchema, ['id', 'active', 'created_at', 'updated_at', 'deleted_at']);
export type ComponentCreateData = v.InferOutput<typeof ComponentCreate>;
export const componentShow = ["id", "sku", "name", "description", "category_id", "manufacturer_id", "stock", "stock_min", "metric", "datasheet_url", "image_url", "notes"];


const LocationSchema = v.object({
    id: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    path: v.string(),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const locationCreate = v.omit(LocationSchema, ['id', 'created_at', 'updated_at', 'deleted_at']);
export type LocationCreateData = v.InferOutput<typeof locationCreate>;
export const locationShow = ["id", "name", "description", "path"];

const ManufacturerSchema = v.object({
    id: v.number(),
    name: v.string(),
    website: v.optional(v.string()),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const ManufacturerCreate = v.omit(ManufacturerSchema, ['id', 'created_at', 'updated_at', 'deleted_at']);
export type ManufacturerCreateData = v.InferOutput<typeof ManufacturerCreate>;
export const ManufacturerShow = ["id", "name", "website"];

const toolStaus = ['available', 'in_use', 'maintenance', 'disposed', 'lent'] as const;
const ToolSchema = v.object({
    id: v.number(),
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
    notes: v.optional(v.string()),
    active: v.optional(v.boolean()),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const ToolCreate = v.omit(ToolSchema, ['id', 'active', 'created_at', 'updated_at', 'deleted_at']);
export type ToolCreateData = v.InferOutput<typeof ToolCreate>;
export const toolShow = ["id", "sku", "name", "manufacturer_id", "model", "serial_number", "image_url", "manual_url", "category_id", "location_id", "state", "acquisition_date", "calibration_required", "next_calibration_date", "notes", "active"];
export const ToolStatusSchema = v.picklist(toolStaus);

const projectStatus = ['planning', 'active', 'paused', 'completed', 'cancelled'] as const;
const ProjectSchema = v.object({
    id: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    state: v.picklist(projectStatus),
    start_date: v.date(),
    end_date: v.optional(v.date()),
    notes: v.optional(v.string()),
    category_id: v.number(),
    created_at: v.optional(v.date()),
    updated_at: v.optional(v.date()),
    deleted_at: v.optional(v.date())
});
export const ProjectToolCreate = v.object({
    project_id: v.number(),
    tool_id: v.number(),
    loan_date: v.optional(v.date()),
    return_date: v.optional(v.date()),
    user_id: v.number()
});
export type ProjectToolCreateData = v.InferOutput<typeof ProjectToolCreate>;
export const ProjectComponentCreate = v.object({
    project_id: v.number(),
    component_id: v.number(),
    planned_quantity: v.number(),
    used_quantity: v.number(),
    notes: v.optional(v.string())
});
export type ProjectComponentCreateData = v.InferOutput<typeof ProjectComponentCreate>;
export const ProjectCreate = v.omit(ProjectSchema, ['id', 'created_at', 'updated_at', 'deleted_at']);
export type ProjectCreateData = v.InferOutput<typeof ProjectCreate>;
export const ProjectStatusSchema = v.picklist(projectStatus);
export const ProjectShow = ["id", "name", "description", "state", "start_date", "end_date", "notes", "category_id"];

const MovementSchema = v.object({
    id: v.number(),
    component_id: v.number(),
    type: v.picklist(['entry', 'exit', 'transfer', 'adjustment', 'disposal']),
    amount: v.number(),
    origin_location_id: v.optional(v.number()),
    destination_location_id: v.optional(v.number()),
    project_id: v.optional(v.number()),
    user_id: v.number(),
    notes: v.optional(v.string()),
    created_at: v.optional(v.date())
});
export const MovementQuerySchema = v.object({
    component_id: v.optional(NumberSchema),
    type: v.optional(v.picklist(['entry', 'exit', 'transfer', 'adjustment', 'disposal'])),
    since: v.optional(v.string()),
    until: v.optional(v.string()),
    limit: v.optional(NumberSchema),
    offset: v.optional(NumberSchema)
});
export type MovementQueryData = v.InferOutput<typeof MovementQuerySchema>;
export const MovementCreate = v.omit(MovementSchema, ['id', 'created_at']);
export type MovementCreateData = v.InferOutput<typeof MovementCreate>;
export const MovementShow = ["id", "component_id", "type", "amount", "origin_location_id", "destination_location_id", "project_id", "user_id", "notes", "created_at"];