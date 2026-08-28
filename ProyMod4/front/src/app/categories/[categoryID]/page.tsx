import { getProductByCategoryId } from '@/services/getProducts';
import Card from '@/components/Card/Card';
import React from 'react'

export default async function CategoryPage({
    params
}: {
    params:Promise<{ categoryID: string }>;
}) {
    const { categoryID } = await params;
    const products = await getProductByCategoryId(Number(categoryID));

    return (
        <div className="mx-auto mt-24 sm:px-10xl:px-44 flex flex-wrap justify-center gap-2 lg:gap-5 xl:gap-8 mb-6">
                {products && products.map((product) => {
                    return(
                        <div key={product.id}>
                            <Card product={product}/>
                        </div>
                    )
                })}
        </div>
    )
};
