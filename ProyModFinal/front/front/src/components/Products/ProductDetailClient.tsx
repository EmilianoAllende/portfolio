"use client";
import ProductViewerClient from "./ProductViewerClient";
import { Variant } from "./ProductViewerClient";


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

interface Color {
    id: string;
    color: string;
    hexCode: string;
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
        return color ? color.color : id; 
    };

    const getColorHexCode = (id: string): string => {
        const color = colors.find((c) => c.id === id);
        return color ? color.hexCode : '#FFFFFF'; 
    };

    if (!product || !product.variants || product.variants.length === 0) {
        return <p className="text-center text-red-500 font-semibold">No hay productos disponibles.</p>;
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                <ProductViewerClient
                    product={{
                        name: product.name,
                        description: product.description,
                        sale_price: product.sale_price,
                    }}
                    variants={product?.variants ?? []}
                    getColorHexCode={getColorHexCode} 
                    getColorLabel={getColorLabel}
                    getSizeLabel={getSizeLabel}
                />
            </div>
        </div>
    );
};

export default ProductDetailClient;



// "use client";
// import ProductViewerClient, { Variant } from "./ProductViewerClient"; // ✅ importar desde donde esté bien definido
// // Podés cambiar esta importación si la interfaz Variant está en otro archivo
// // pero asegurate de que tenga el campo `id: string`

// interface Product {
//   name: string;
//   description: string;
//   sale_price: number;
//   variants: Variant[];
// }

// interface Size {
//   id: string;
//   size_us?: number;
//   size_eur?: number;
//   size_cm?: number;
// }

// interface Color {
//   id: string;
//   color: string;
//   hexCode: string;
// }

// interface Props {
//   product: Product;
//   sizes: Size[];
//   colors: Color[];
// }

// const ProductDetailClient: React.FC<Props> = ({ product, sizes, colors }) => {
//   const getSizeLabel = (id: string): string => {
//     const size = sizes.find((s) => s.id === id);
//     if (!size) return id;
//     return [
//       size.size_us ? `US: ${size.size_us}` : null,
//       size.size_eur ? `EUR: ${size.size_eur}` : null,
//       size.size_cm ? `CM: ${size.size_cm}` : null,
//     ]
//       .filter(Boolean)
//       .join(" - ");
//   };

//   const getColorLabel = (id: string): string => {
//     const color = colors.find((c) => c.id === id);
//     return color ? color.color : id;
//   };

//   const getColorHexCode = (id: string): string => {
//     const color = colors.find((c) => c.id === id);
//     return color ? color.hexCode : "#FFFFFF";
//   };

//   if (!product || !product.variants || product.variants.length === 0) {
//     return (
//       <p className="text-center text-red-500 font-semibold">
//         No hay productos disponibles.
//       </p>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
//       <div className="max-w-6xl mx-auto">
//         <ProductViewerClient
//           product={{
//             name: product.name,
//             description: product.description,
//             sale_price: product.sale_price,
//           }}
//           variants={product.variants} // ✅ aquí cada Variant ya contiene `id`, que es el `variant_product_id`
//           getColorHexCode={getColorHexCode}
//           getColorLabel={getColorLabel}
//           getSizeLabel={getSizeLabel}
//         />
//       </div>
//     </div>
//   );
// };

// export default ProductDetailClient;