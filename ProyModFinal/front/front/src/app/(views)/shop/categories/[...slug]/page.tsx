"use client";

import { useParams } from "next/navigation";
import ProductList from "@/components/Products/ProductList";
import SubcategoryList from "@/components/Products/SubcategoryList"; // Si no existe, lo creamos

const Page = () => {
  const params = useParams();
  const slugParam = params?.slug;


  if (!slugParam || typeof slugParam === "string") {
    return <p className="text-center mt-10">Ruta no válida</p>;
  }

  const slug = slugParam as string[];
console.log("slug:", slug);
  // /shop/categories/[categoria]
  if (slug.length === 1) {
    console.log("slug:", slug);
    return <SubcategoryList categorySlug={slug[0]} />;
  }

  // /shop/categories/[categoria]/[subcategoria]
  if (slug.length === 2) {
    console.log("slug:", slug);
    return <ProductList category={slug[0]} subcategory={slug[1]} />;
  }

  return <p>Ruta no válida</p>;
};

export default Page;