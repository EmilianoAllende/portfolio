import { getFeaturedProducts } from "@/services/getProducts";
import Card from "@/components/Card/Card";
import { IProduct } from "@/interfaces/Product";
import Link from "next/link";

export default async function Home() {
    const featuredProducts: IProduct[] = await getFeaturedProducts();

    return (
        <div className="min-h-screen border-primaryColor border-8 border-y-0 bg-cyan-600 bg-opacity-60 rounded-xl text-white mt-6">
            <div className="relative w-full h-60 bg-gradient-to-r from-quaternaryColor to-tertiaryColor flex items-center justify-center text-4xl font-extrabold shadow-lg rounded-2xl">
                <p className="animate-pulse">🔥 Limited-Time Offers! Get Yours Now! 🔥</p>
            </div>
            <div className="mx-auto mt-16 px-10 flex flex-col gap-16">
                <div className="flex flex-wrap gap-6 lg:gap-8 justify-center">
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="hover:scale-105 transition-transform duration-300">
                            <Card product={product} />
                        </div>
                    ))}
                </div>

                <Link href="/products" className="mx-auto">
                    <h3 className='font-black text-4xl bg-black text-sky-600 rounded-full py-2 px-4 hover:text-black hover:bg-sky-600'>GO TO PRODUCTS</h3>
                </Link>
            </div>

            <div className="mt-20 p-10 bg-cyan-800 rounded-2xl shadow-xl text-center border-t-2 border-t-emerald-400">
                <h2 className="text-3xl font-bold mb-6 border-b-2">Explore More About Us</h2>
                <div className="flex flex-col lg:flex-row justify-center gap-20">

                    <div className="bg-[radial-gradient(circle_at_center,_#2772db,_#164e63)] p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                        <h3 className="text-2xl font-semibold mb-3">Who We Are</h3>
                        <p className="text-sm mb-4">Discover our story and mission at TechHome.</p>
                        <Link href="/about" className="bg-quaternaryColor text-black px-4 py-2 rounded-md hover:bg-white transition-all duration-300">
                            Learn More
                        </Link>
                    </div>

                    <div className="bg-[radial-gradient(circle_at_center,_#164e63,_#2772db)] p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                        <h3 className="text-2xl font-semibold mb-3">Join Our Team</h3>
                        <p className="text-sm mb-4">Be part of our technological revolution.</p>
                        <Link href="/work" className="bg-quaternaryColor text-black px-4 py-2 rounded-md hover:bg-white transition-all duration-300">
                            Join Us
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
};