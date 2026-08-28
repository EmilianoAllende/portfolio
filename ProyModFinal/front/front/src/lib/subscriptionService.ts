import api from './axiosInstance';

interface CheckoutPayload {
    email: string;
    name: string;
    price_id: string;
}

export const createCheckoutSession = async ({
        email,
        name,
        price_id,
    }: CheckoutPayload): Promise<string> => {
    try {
        const response = await api.post('/subscriptions/checkout-session', {            
            email,
            name,
            price_id,
        });
        console.log("Subscrption ServiceWorker",response);
        
        const url = response?.data?.checkoutUrl;
        if (!url) {
            throw new Error('No se recibió la URL de Stripe.');
        }
            return url; // { url: "https://checkout.stripe.com/..." }
    } catch (error) {
        console.error('Error al crear la sesión de Stripe:', error);
        throw new Error('No se pudo iniciar la sesión de pago.');
    }
};