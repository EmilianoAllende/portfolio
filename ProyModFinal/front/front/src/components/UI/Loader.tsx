import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-60 z-[9999] flex items-center justify-center">
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-10 h-10 animate-spin text-gray-300 fill-[#6e5cc4]"
          viewBox="0 0 100 101"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.6C100 78.2 77.6 100.6 50 100.6C22.4 100.6 0 78.2 0 50.6C0 22.98 22.4 0.59 50 0.59C77.6 0.59 100 22.98 100 50.6Z"
            fill="currentColor"
          />
          <path
            d="M93.97 39.04C96.39 38.4 97.86 35.91 97.01 33.55C95.29 28.82 92.87 24.37 89.82 20.35C85.85 15.12 80.88 10.72 75.21 7.41C69.54 4.1 63.28 1.94 56.77 1.05C51.77 0.37 46.7 0.45 41.73 1.28C39.26 1.69 37.81 4.2 38.45 6.62C39.09 9.05 41.57 10.47 44.05 10.11C47.85 9.55 51.72 9.53 55.54 10.05C60.86 10.78 65.99 12.55 70.63 15.26C75.27 17.96 79.33 21.56 82.58 25.84C84.92 28.91 86.8 32.29 88.18 35.88C89.08 38.22 91.54 39.68 93.97 39.04Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
};
export default Loader;