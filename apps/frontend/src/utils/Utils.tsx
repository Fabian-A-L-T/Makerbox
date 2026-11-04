import React from "react";
import type { ApiResponse } from "../interfaces/schemas";
import { makerboxApi } from "../api/makerbox.api";
import { RiImageLine, RiLoader5Line } from "@remixicon/react";
import { useEffect, useState, type DetailedHTMLProps, type ImgHTMLAttributes } from "react";

export const paginationLimit = 60;
export const paginationMaxPages = 5;
export const elementsPerPage = ~~(paginationLimit / paginationMaxPages);

export const paginationParams = {
	limit: paginationLimit,
	maxPages: paginationMaxPages
}

export const quillInlineStyles = {
	font: {
		'serif': 'font-family: Georgia, Times New Roman, serif',
		'monospace': 'font-family: Monaco, Courier New, monospace'
	},
	size: {
		'small': 'font-size: 0.75em',
		'large': 'font-size: 1.5em',
		'huge': 'font-size: 2.5em'
	},
	indent: (value: string, op: any) => {
		var indentSize = parseInt(value, 10) * 3;
		var side = op.attributes['direction'] === 'rtl' ? 'right' : 'left';
		return 'padding-' + side + ':' + indentSize + 'em';
	},
	direction: (value: string, op: any) => {
		if (value === 'rtl') {
			return 'direction:rtl' + ( op.attributes['align'] ? '' : '; text-align: inherit' );
		} else {
			return '';
		}
	}
};

interface ResourceFilter {
	cursor: number;
	currentPage?: number;
	search?: string;
	orderBy?: string;
	desc?: boolean;
	category?: number;
	manufacturer?: number;
	aditionalQueries?: Record<string, string | number>;
}

interface Pagination {
    page: number,
    maxPages: number,
    limit: number
}

export interface FetchFilter {
	search?: string,
	orderBy?: string,
	desc?: string,
	[key: string]: string | number | undefined;
}

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function validateImgSize(image: File){
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(image);
		
		img.onload = () => {
			URL.revokeObjectURL(img.src);

			if (img.width  > 1600 || img.height > 1600) {
				reject('Las dimensiones no deben ser mayores a 1600x1600px');
			} 
			else {
				resolve(image);
			}
		};
		
		img.onerror = () => reject('Formato invalido');
	});
}

export async function handleUpload(fileToUpload: File, type: 'image' | 'document') {
	if (!fileToUpload) return;
	
	const formImage = new FormData();
		formImage.append(`${type}s`, fileToUpload);
		try {
			let response = await makerboxApi.post(`/api/files/upload/${type}`, formImage, {
				withCredentials: true,
				headers: {
					'Content-Type': 'multipart/form-data',
				}
			});
			return response?.data?.url;
		} 
		catch (error: any) {
			throw new Error(error.response?.data?.error ?? error.message);
		}
}

export async function handleDelete(fileRoute: string) {
	try {
		await makerboxApi.post(`/api/files/delete`, { fileUrl: fileRoute }, {
			withCredentials: true,
		});
	} catch (error: any) {
		throw new Error(error.response?.data?.error ?? error.message);
	}
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchData<T>(apiRoute: string, pagination?: Pagination,  filter?: FetchFilter){
	if(filter){
		const cursor = pagination ? Math.floor((pagination.page-1)/pagination.maxPages) : 0;
		const params = new URLSearchParams({
			...(pagination 	&& { offset: (pagination.limit * cursor).toString(), 
								 limit: pagination.limit.toString()}),
			...filter
		});
		const query = apiRoute.includes('?') ? `${apiRoute}&${params}` : `${apiRoute}?${params}`;
		console.log('Query: ' + query);
		//await delay(200);
		const res = await makerboxApi.get<ApiResponse<T[]>>(query);
		return res.data;
	}
	else {
		console.log('Query: ' + apiRoute);
		//await delay(200);
		const res = await makerboxApi.get<ApiResponse<T[]>>(apiRoute);
		return res.data;
	}
}

interface AsyncImgProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>,HTMLImageElement> {
    notfoundsubtitle?: string
}

export function AsyncImg(props: AsyncImgProps): React.ReactNode{
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
	const [imgURL, setImgURL] = useState<string | null>(null);

    useEffect(() => {
        if(props.src){
			makerboxApi.get(props.src, { responseType: 'blob'})
			.then((response) => {
				setImgURL(URL.createObjectURL(response.data))
				setTimeout( () => setLoaded(true),200);
			})
			.catch(() => setError(true));
        }
        else {
            setError(true);
        }
    }, [props.src]);

    if(loaded && imgURL) return <img {...props} src={imgURL}/>;
    else if(error) 
        return  <div className={`flex flex-col gap-2 items-center justify-center bg-[var(--color-form-text-bg)] ${props.className ?? ''}`}>
                    <RiImageLine size={48} color="var(--color-text-muted)"/>
                    {props.notfoundsubtitle && <p className="text-sm text-center text-[var(--color-text-muted)]">{props.notfoundsubtitle}</p>}
                </div>;
    else 
        return  <div className={`flex items-center justify-center bg-[var(--color-form-text-bg)] ${props.className ?? ''}`}>
                    <RiLoader5Line color="var(--color-text-muted)" className='transition-transform duration-300 animate-spin' size={48} />
                </div>;
}

export type { ResourceFilter };
