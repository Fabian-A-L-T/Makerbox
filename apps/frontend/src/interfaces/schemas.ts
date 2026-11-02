import { object, optional, fallback, pipe, number, minValue, string, maxLength } from "valibot";

export const resourceQuerySchema = object({
    page: optional(fallback(pipe(number(), minValue(1)),1),1),
	search: optional(pipe(string(), maxLength(200, 'Texto de búsqueda muy largo'))),
	orderBy: optional(string()),
	desc: optional(fallback(string(), 'false'))
})

export interface ApiResponse<T> {
    content: T,
    pagination: {
        limit:  number,
        offset: number
    }
    links?: {
        start: string, 
        prev: string | undefined, 
        next: string | undefined
    }
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'technician' | 'reader';
    passwd: string
}

export interface Category {
    id: number;
    name: string;
    path: string;
}

export interface Location {
    id: number;
    name: string;
    description: string;
    path: string;
}

export interface ComponentLocation {
    location_name: string,
    location_description?: string,
    location_route: string,
    component_id: number,
    location_id: number,
    amount: number
}

export interface Component {
    id: number;
    sku: string;
    name: string;
    description: string;
    category_id: number;
    category: string;
    manufacturer_id: number;
    manufacturer: string;
    manufacturer_website?: string;
    stock: number;
    stock_min: number;
    unit_cost: number;
    datasheet_url: string;
    image_url: string;
    notes: string;
    created_at: string
}

export interface Movement {
    id: number;
    component_id: number;
    component_name: string;
    component_sku: string;
    stock_type: 'entry' | 'reserve' | 'return' | 'transfer' | 'disposal';
    amount: number;
    origin_location_id: number | null;
    origin_location_name: string | null;
    destination_location_id: number | null;
    destination_location_name: string | null;
    project_id: number | null;
    project_name: string | null;
    user_id: number;
    user_name: string;
    notes: string | null;
    created_at: string;
}

export interface Manufacturer {
    id: number;
    name: string;
    website: string;
}

export interface Tool {
    id: number
    sku: string
    name: string
    manufacturer: string
    manufacturer_id: number
    model: string
    serial_number: string
    image_url: string
    manual_url: string
    category: string
    category_id: number
    location_name: string
    location_route: string
    location_description: string
    location_id: number
    state: 'available' | 'in_use' | 'maintenance' | 'disposed' | 'lent'
    acquisition_date: string
    notes: string
    created_at: string
}

export interface Project {
    id: number;
    name: string;
    components: ProjectComponent[];
    milestones: Milestone[];
    description: string;
    state: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
    start_date: string;
    end_date_estimated?: string;
    end_date_real?: string;
    responsible_id: number;
    user_name: string;
    budget?: string;
    image_url?: string;
    repository_url?: string;
    created_at: string;
}

export interface ProjectComponent {
    project_id: number,
    project_name: string,
    component_id: number,
    name: string,
    sku: string,
    planned_amount: number,
    unit_cost: number,
    used_amount: number,
    notes?: string
}

export interface Milestone {
    completed_at: Date,
    created_at: Date,
    description: string,
    id: number,
    is_completed: boolean,
    order_index: number,
    project_id: number,
    title: string
}

export interface ComponentStats {
    category_id: number,
    category_name: string,
    category_path: string,
    category_cost: string,
    category_stock: string,
    avg_unit_cost: string
}

export interface ToolStats {
    category_id: number,
    category_name: string,
    category_path: string,
    category_cost: string,
    category_stock: string,
    avg_cost: string
}

export interface ProjectStats {
    state: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled',
    project_count: string,
    total_budget: string,
    avg_budget: string
}