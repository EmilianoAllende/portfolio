import { getProducts } from "@/services/getProducts";
import { IProduct } from "@/interfaces/Product";
import Card from "@/components/Card/Card";


export default async function productsPage() {
    const products: IProduct[] = await getProducts();

    return (
        <div className="mx-auto mt-24 sm:px-10xl:px-44 flex flex-wrap justify-center gap-2 lg:gap-5 xl:gap-8 mb-6">
            {products.map((product) => (
                <div key={product.id}>
                        <Card product={product} />
                </div>
            ))}
        </div>
    );
};