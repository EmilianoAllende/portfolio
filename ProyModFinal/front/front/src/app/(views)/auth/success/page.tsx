import { Suspense } from "react";
import GoogleSuccess from "./GoogleSuccess";

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Cargando...</p>}>
      <GoogleSuccess />
    </Suspense>
  );
}
