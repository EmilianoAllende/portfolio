export interface ISize {
    id: string;
    size_us?: number;
    size_eur?: number;
    size_cm?: number;
    talle?: string; 
}

export interface IColor {
    id: string;
    color: string; 
    hexCode: string;
}

export interface IProductSize {
    id: string; 
    stock: number;
    size_id: string;
    size: ISize; 
    variant_product_id: string;
}

export interface IProductVariant {
    id: string; 
    description: string; 
    image: string[];
    color_id: string;
    color: IColor; 
    product_id: string;
    variantSizes?: IProductSize[]; 
}

export interface IApiProductExtended {
    id: string;
    name: string;
    description: string;
    code: string;
    purchase_price: string;
    sale_price: string | number;
    category_id: string;
    sub_category_id: string;
    brand_id: string;
    category: any; 
    subCategory: any; 
    brand: any; 
    variants?: IProductVariant[]; 
}

export interface IPaginatedProductsResponse {
    products: IApiProductExtended[];
    total: number;
    page: number;
    limit: number;
}