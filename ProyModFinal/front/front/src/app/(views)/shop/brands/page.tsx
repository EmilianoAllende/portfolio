import React from "react";
import BreadcrumbClient from "@/components/UI/Breadcrumb";
import BrandList from "./components/BrandList";

export default function BrandsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <BreadcrumbClient />
      <BrandList />
    </div>
  );
}