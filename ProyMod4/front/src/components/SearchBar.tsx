"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/interfaces/Product";

interface SearchBarProps {
  products: IProduct[];
}

const SearchBar = ({ products }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""); // solo letras, números y espacios
    setSearchTerm(value);

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const navigateToProduct = (id: string) => {
    router.push(`/products/${id}`);
    setSearchTerm("");
    setFilteredProducts([]);
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleSearch}
        className="border border-gray-300 p-2 rounded-lg w-full text-black"
      />

      {searchTerm.trim() !== "" && (
        <ul className="absolute z-30 bg-white text-black shadow-lg w-full mt-1 max-h-60 overflow-y-auto rounded-md">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <li
                key={product.id}
                onClick={() => navigateToProduct(String(product.id))}
                className="px-3 py-1 hover:bg-gray-200 cursor-pointer"
              >
                {product.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">Product not found...</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;