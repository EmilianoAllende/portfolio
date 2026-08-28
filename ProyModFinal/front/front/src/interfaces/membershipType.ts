export default interface IMembershipType {
    id: string;
    name: string;
    stripe_price_id: string;
    description?: string;
    price:number
};