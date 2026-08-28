"use client"

import Image from 'next/image';
import { IProduct } from '@/interfaces/Product';
import AddProduct from '../AddProduct';
import Link from 'next/link';
import { useFavorites } from '@/contexts/FavoritesContext';
import favIcon from "@/utils/heart-alt-svgrepo-com.svg";
import { useContext } from 'react';
import { AuthContext } from '@/helpers/authContext';

export default function Card({ product }: { product: IProduct }) {
  const { name, price, image } = product;
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(product.id)
  const user = useContext(AuthContext);

  return (
    <div className="text-quaternaryColor bg-secondaryColor bg-opacity-70 text-center rounded-lg flex flex-col items-center transform group hover:scale-110 hover:transition-all duration-1000 hover:bg-primaryColor hover:bg-opacity-80 h-72 w-auto md:w-60  md:h-80 lg:w-80 lg:h-96 relative lg:static">
      {user && (<div className="">
        <Image
          src={favIcon}
          alt="favorite icon"
          width={24}
          height={24}
          onClick={(event) => {
            event.preventDefault();
            toggleFavorite(product);
          }}
          className={`absolute top-1 left-1 w-6 h-6 cursor-pointer z-10 transition ${
            favorite ? "text-red-500 fill-red-500" : "opacity-50"
          }`}
          style={{ filter: favorite ? "invert(18%) sepia(100%) saturate(7480%) hue-rotate(355deg) brightness(90%) contrast(115%)" : "grayscale(1)" }}
        />
      </div>)}
      <h3 className='border-b-tertiaryColor border-b-2 md:mt-1 md:mb-2 md:text-lg lg:text-xl'>{name}</h3>
      <Image src={image} alt={`${name}`} width={400} height={400} className='max-w-36 max-h-40 md:max-h-48 md:max-w-44 lg:max-h-56 my-auto' />
      <Link href={`/products/${product.id}`} className=' mb-16 mt-1 md:mt-1 lg:mb-1 text-transparent rounded-3xl px-2 group-hover:text-primaryColor group-hover:bg-tertiaryColor'>Full Product</Link>
      <p className=' absolute lg:static bottom-12 lg:mb-0'>${price}</p>
      <div className='my-1 bg-secondaryColor rounded-full py-2 px-3 w-fit absolute bottom-1 lg:static lg:mb-2'>
        <AddProduct product={product}/>
      </div>
    </div>
  );
};