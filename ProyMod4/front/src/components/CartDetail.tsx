"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import Roby from "@/../public/CartToProducts.png";
import { AuthContext } from "@/helpers/authContext";
import { useCart } from "@/contexts/CartContext";
import { postOrders } from "@/services/orders";
import Swal from "sweetalert2";

const CartDetail = () => {
    const { items: cart, emptyCart, removeItemFromCart } = useCart();
    const { user, addOrder } = useContext(AuthContext);

    const handleBuy = async () => {
        const res = await postOrders(user?.id || 0, user?.token || "", cart);

        if (res.status === "approved") {
            if (addOrder) {
                addOrder(res.id);
            } else {
                console.warn("addOrder is undefined. Order won't be updated in context.");
            }

            Swal.fire({
                title: "Purchased!",
                text: `Your order was successfully processed with ID: ${res.id}.`,
                icon: "success"});
            emptyCart();

        } else {
            swal("Error", `Your order can't be processed. ${res}`, "error");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-primaryColor shadow-lg rounded-lg mt-8">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center text-center">
                    <h2 className="bg-tertiaryColor text-3xl text-center font-bold rounded-xl px-3">CART IS EMPTY.</h2>
                    <Image src={Roby} width={400} alt="Buy-Img" />
                    <Link href="/products">
                        <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            Go to PRODUCTS
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid">
                    <h2 className="text-2xl font-semibold text-white mb-4 text-center">YOUR CART</h2>
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 border-b">
                                <div className="flex w-full h-30 items-center">
                                    <h3 className="text-lg font-medium text-quaternaryColor mr-auto">{item.name}</h3>
                                    <Image src={item.image} alt="product_image" width={50} height={50} className="mr-36 h-auto"/>
                                    <p className=" text-tertiaryColor justify-center">${item.price}</p>
                                </div>
                                <button
                                    onClick={() => removeItemFromCart(item.id)}
                                    className=" ml-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                                <button
                                    onClick={() => emptyCart()}
                                    className="justify-self-end mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Remove All
                                </button>
                    <div className="grid justify-center items-center mt-6">
                        <p className="text-lg text-green-400 font-extrabold">Total: ${cart.reduce((acc, item) => acc + item.price, 0)}</p>
                        <button
                            onClick={handleBuy}
                            disabled={cart.length === 0}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            BUY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartDetail;
