"use client";

import React, { useState } from "react";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { IEmployee, IRole } from "@/interfaces/index";

interface TableEmployeeProps {
    employees: IEmployee[];
    rolesDisponibles: IRole[];
    onDelete: (employeeId: string) => void;
    refreshEmployees: () => void;
}

const TableEmployee: React.FC<TableEmployeeProps> = ({ employees, rolesDisponibles, onDelete, refreshEmployees }) => {
    const [editing, setEditing] = useState<IEmployee | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoleIds(prev => 
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        if (!editing) return;
        try {
            await api.put(`/employees/${editing.userId}/roles`, {
                roleIds: selectedRoleIds,
            });
            toast.success("Roles actualizados.");
            setEditing(null);
            refreshEmployees();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Error al actualizar roles.");
        }
    };

    return (
        <div>
            <table className="min-w-full border border-gray-300 text-sm bg-white shadow rounded">
                <thead className="bg-secondary border border-secondary text-white">
                    <tr>
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Roles</th>
                        <th className="text-center p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.userId} className="border-t border-gray-300 hover:bg-gray-50">
                            <td className="p-3">{emp.name}</td>
                            <td className="p-3">{emp.email}</td>
                            <td className="p-3">{emp.roles.join(", ")}</td>
                            <td className="p-3">
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setEditing(emp);
                                            const matchedRoles = rolesDisponibles.filter(r => emp.roles.includes(r.name));
                                            setSelectedRoleIds(matchedRoles.map(r => r.id));
                                        }}
                                        className="text-primary hover:text-neutral-700 cursor-pointer"
                                        title="Editar roles"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(emp.userId)}
                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                        title="Eliminar empleado"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Editar roles de {editing.name}</h3>
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                            {rolesDisponibles.map((role) => (
                                <label key={role.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoleIds.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                    />
                                    <span className="font-medium">{role.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-200 text-black px-4 py-1 rounded cursor-pointer"
                                onClick={() => setEditing(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="bg-primary text-white px-4 py-1 rounded cursor-pointer"
                                onClick={handleSave}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableEmployee;