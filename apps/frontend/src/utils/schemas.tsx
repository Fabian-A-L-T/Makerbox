import { object, optional, fallback, pipe, number, minValue, string, maxLength, boolean } from "valibot";

export const resourceQuerySchema = object({
    page: optional(fallback(pipe(number(), minValue(1)),1),1),
	search: optional(pipe(string(), maxLength(200, 'Texto de búsqueda muy largo'))),
	orderBy: optional(string()),
	desc: optional(fallback(boolean(), false))
})

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
    id: number;
    name: string;
    component_id: number;
    location_id: number;
    amount: number;
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
    stock: number;
    stock_min: number;
    metric: string;
    datasheet_url: string;
    image_url: string;
    notes: string;
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
    location: string
    location_id: number
    state: 'available' | 'in_use' | 'maintenance' | 'disposed' | 'lent'
    acquisition_date: string
    calibration_required: boolean
    next_calibration_date: string
    notes: string
}