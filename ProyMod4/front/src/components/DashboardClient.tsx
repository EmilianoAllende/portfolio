"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const DashboardClient = () => {
    const router = useRouter();
    const { user, orders } = useAuth();
    const { name, email, address, phone } = user ?? {};

    //? Estado para la búsqueda por ID
    const [searchOrderId, setSearchOrderId] = useState("");
    const [filteredOrders, setFilteredOrders] = useState(orders || []);

    useEffect(() => {
        if (!user) {
            router.push("/home");
        }
    }, [router, user]);

    //* Actualizar la lista de órdenes mostradas según el input
    useEffect(() => {
        if (!searchOrderId.trim()) {
            setFilteredOrders(orders || []);
        } else {
            const filtered = orders?.filter(order =>
                order.id.toString().includes(searchOrderId.trim())
            ) || [];
            setFilteredOrders(filtered);
        }
    }, [searchOrderId, orders]);

    //* Función auxiliar para formatear la fecha
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="mx-auto text-justify text-tertiaryColor text-lg mt-8 w-2/3">
            <h1 className="bg-primaryColor rounded-xl w-full p-4 font-bold text-4xl text-center justify-self-center">{">>>>>> PROFILE <<<<<<"}</h1>

            <div className="bg-primaryColor bg-opacity-90 rounded-xl p-4 my-3 justify-self-center">
                <div className="flex">
                    <p>NAME:</p>
                    <p className="text-gray-200 font-semibold ml-3">{name}</p>
                </div>
                <div className="flex">
                    <p>EMAIL:</p>
                    <p className="text-gray-200 font-semibold ml-3">{email}</p>
                </div>
                <div className="flex">
                    <p>PHONE:</p>
                    <p className="text-gray-200 font-semibold ml-3">{phone}</p>
                </div>
                <div className="flex">
                    <p>ADDRESS:</p>
                    <p className="text-gray-200 font-semibold ml-3">{address}</p>
                </div>
            </div>

            <div className="mt-4 bg-secondaryColor bg-opacity-90 rounded-xl p-4">
                <h5 className="text-2xl font-bold mb-2 text-center">ORDERS</h5>

                <div className="mb-4 justify-self-center grid">
                    <label htmlFor="order-search" className="block mb-1 font-medium justify-self-center">Search order by ID:</label>
                    <input
                        id="order-search"
                        type="text"
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value)}
                        placeholder="Enter order ID"
                        className="px-3 py-2 rounded-md border border-gray-300 w-7/12 text-black justify-self-center"
                    />
                </div>

                {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                        <div key={index} className="border-b-2 border-rose-50 mb-3 flex flex-row}">
                            <div>
                                <p className="font-semibold">ID: {order.id}</p>
                                <p className="font-semibold">Status: {order.status}</p>
                                <p>Date: {formatDate(order.date)}</p>
                            </div>

                            <div className="mx-auto">
                                <p className="underline">Products:</p>
                                {order.products.map((product, i) => (
                                    <p key={i}>- {product.name}: ${product.price}</p>
                                ))}
                            </div>

                            <div className="my-auto ml-auto">
                                <p className="mt-2 font-bold">
                                    Total: ${order.products.reduce((sum, prod) => sum + prod.price, 0)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No orders found with that ID.</p>
                )}
            </div>
        </div>
    );
};