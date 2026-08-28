// src/components/ui/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  nextPage,
  prevPage,
//   goToPage,
}) => {
  if (totalPages <= 1) return null; // No mostrar si solo hay una página

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
        Anterior
      </button>

      <div className="text-sm text-gray-700">
        Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
      </div>

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
        <ChevronRight size={16} />
      </button>
    </div>
  );
};