import CartDetail from "@/components/CartDetail";
import AuthProtected from "@/components/AuthProtected";

export default function Cart() {
    return (
        <AuthProtected>
            <CartDetail/>
        </AuthProtected>
    );
};