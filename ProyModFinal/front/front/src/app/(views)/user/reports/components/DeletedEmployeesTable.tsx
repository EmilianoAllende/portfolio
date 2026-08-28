"use client";

import React from "react";
import { Undo2 } from "lucide-react";
import { IEmployee } from "@/interfaces/index";

interface DeletedEmployeesTableProps {
  employees: IEmployee[];
  onRestore: (userId: string) => void;
}

const DeletedEmployeesTable: React.FC<DeletedEmployeesTableProps> = ({ employees, onRestore }) => {
  if (employees.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No hay empleados eliminados.</p>;
  }

  return (
    <table className="min-w-full border border-gray-300 text-sm bg-white shadow rounded">
      <thead className="bg-gray-700 border border-gray-700 text-white">
        <tr>
          <th className="text-left p-3">Nombre</th>
          <th className="text-left p-3">Email</th>
          <th className="text-left p-3">Roles Anteriores</th>
          <th className="text-center p-3">Acción</th>
        </tr>
      </thead>

      <tbody>
        {employees.map((emp) => (
          <tr key={emp.userId} className="border-t border-gray-300 hover:bg-gray-50">
            <td className="p-3">{emp.name}</td>
            <td className="p-3">{emp.email}</td>
            <td className="p-3">{emp.roles.join(", ")}</td>
            
            <td className="p-3 text-center">
              <button
                onClick={() => onRestore(emp.userId)}
                className="text-green-600 hover:text-green-800 cursor-pointer"
                title="Restaurar empleado"
              >
                <Undo2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeletedEmployeesTable;