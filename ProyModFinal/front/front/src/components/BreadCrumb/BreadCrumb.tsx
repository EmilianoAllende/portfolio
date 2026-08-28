"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { displayNames } from "./Names";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface CustomBreadcrumbProps {
  customItems?: BreadcrumbItem[];
}

export const Breadcrumb = ({ customItems }: CustomBreadcrumbProps) => {
  const pathname = usePathname();

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  if (customItems && customItems.length > 0) {
    return (
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-1">
          {customItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="text-gray-400">/</span>}
              {item.current || !item.href ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-200 text-indigo-800">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => decodeURIComponent(seg));

  const filteredSegments = segments.filter((seg, i, arr) => {
    return !(arr.includes("products") && i > arr.indexOf("products"));
  });

  const breadcrumbs = filteredSegments.map((seg, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === filteredSegments.length - 1;

    const isNonLink = [
      "add",
      "settings-manager",
      "shop",
      "user",
      "manager",
      "settings",
    ].includes(seg);

    const label = capitalize(displayNames[seg] ?? seg.replace(/-/g, " "));

    return (
      <li key={`${index}-${href}`} className="flex items-center gap-1">
        {index > 0 && <span className="text-gray-400">/</span>}
        {isNonLink ? (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-600">
            {label}
          </span>
        ) : (
          <Link
            href={href}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              isLast
                ? "bg-indigo-200 text-indigo-800"
                : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            }`}
          >
            {label}
          </Link>
        )}
      </li>
    );
  });

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-1">{breadcrumbs}</ol>
    </nav>
  );
};