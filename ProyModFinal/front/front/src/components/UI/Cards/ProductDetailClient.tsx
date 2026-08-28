"use client";

import ProductViewerClient from "../../Products/ProductViewerClient";
import { Variant } from "../../Products/ProductViewerClient";

interface Product {
  name: string;
  description: string;
  sale_price: number;
  variants: Variant[];
}
interface Size {
    id: string;
    size_us?: number;
    size_eur?: number;
    size_cm?: number;
}
// 1. Asegúrate de que la interfaz Color incluya el código hexadecimal
interface Color {
    id: string;
    name: string;
    hexCode: string; // Propiedad añadida
}
interface Props {
    product: Product;
    sizes: Size[];
    colors: Color[];
}


const ProductDetailClient: React.FC<Props> = ({ product, sizes, colors }) => {

    const getSizeLabel = (id: string): string => {
        const size = sizes.find((s) => s.id === id);
        if (!size) return id;
        return [
            size.size_us ? `US: ${size.size_us}` : null,
            size.size_eur ? `EUR: ${size.size_eur}` : null,
            size.size_cm ? `CM: ${size.size_cm}` : null,
        ]
            .filter(Boolean)
            .join(" - ");
    };

    const getColorLabel = (id: string): string => {
        const color = colors.find((c) => c.id === id);
        return color ? color.name : id;
    };

    // 2. Crea la función que busca y devuelve el código hexadecimal
    const getColorHexCode = (id: string): string => {
        const color = colors.find((c) => c.id === id);
        // Devuelve el código hex o un color por defecto (blanco) si no lo encuentra
        return color ? color.hexCode : '#FFFFFF';
    };

    if (!product || !product.variants || product.variants.length === 0) {
        return <p className="text-center text-red-500 font-semibold">No hay productos disponibles.</p>;
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto">
                <ProductViewerClient
                    product={{
                        name: product.name,
                        description: product.description,
                        sale_price: product.sale_price,
                    }}
                    variants={product?.variants ?? []}
                    getColorLabel={getColorLabel}
                    getSizeLabel={getSizeLabel}
                    // 3. Pasa la nueva función como prop
                    getColorHexCode={getColorHexCode}
                />
            </div>
        </div>
    );
};

export default ProductDetailClient;