'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import TableEmployee from './components/TableEmployee';
import DeletedEmployeesTable from './components/DeletedEmployeesTable';
import ReportsSlider from './components/ReportsSlider';
import api from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { IEmployee, IRole } from '@/interfaces/index';
import { UserX, Users } from 'lucide-react';
import Notiflix from 'notiflix';

export default function ReportsPage() {
    const { user, fetchUser, isInitialized, setInitialized, loading: authLoading, hasRole } = useAuthStore();
    
    useEffect(() => {
        const init = async () => {
            if (!isInitialized) {
                await fetchUser();
                setInitialized(true);
            }
        };
        init();
    }, [isInitialized, fetchUser, setInitialized]);

    // --- Estado para la gestión de empleados ---
    const [view, setView] = useState<'active' | 'deleted'>('active');
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [deletedEmployees, setDeletedEmployees] = useState<IEmployee[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // --- Funciones para obtener datos ---
    const fetchActiveEmployees = async () => {
        setLoadingData(true);
        try {
            const res = await api.get("/employees/list");
            setEmployees(res.data);
        } catch (err) {
            console.error(err)
            toast.error("Error al cargar empleados activos.");
        } finally {
            setLoadingData(false);
        }
    };

    const fetchDeletedEmployees = async () => {
        setLoadingData(true);
        try {
            const res = await api.get("/users/deleted");
            const formattedData = res.data.map((user: any) => ({
                userId: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                roles: user.employee?.roles.map((r: any) => r.name) || ['Cliente'],
            }));
            setDeletedEmployees(formattedData);
        } catch (err) {
            console.error(err)
            toast.error("Error al cargar empleados eliminados.");
        } finally {
            setLoadingData(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get("/roles");
            setRoles(res.data);
        } catch (err) {
            console.error(err)
            toast.error("Error al obtener roles.");
        }
    };

    useEffect(() => {
        if (hasRole('admin')) {
            fetchActiveEmployees();
            fetchRoles();
        }
    }, [user]); // Se ejecuta cuando el usuario se confirma

    // --- Lógica de acciones ---
    const handleDelete = async (employeeId: string) => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar a este empleado?',
            'Sí, eliminar',
            'Cancelar',
            async () => {
                try {
                    await api.delete(`/users/${employeeId}`);
                    toast.success("Empleado eliminado.");
                    fetchActiveEmployees(); // Refrescamos la lista actual
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Error al eliminar.");
                }
            },
            () => {
            }
        );
    };

    const handleRestore = async (userId: string) => {
        Notiflix.Confirm.show(
            'Confirmar restauración',
            "¿Seguro que deseas restaurar a este empleado?",
            "Sí, restaurar",
            "Cancelar",
            async () => {
                try {
                    await api.patch(`/users/${userId}/restore`);
                    toast.success("Empleado restaurado.");
                    fetchDeletedEmployees(); 
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Error al restaurar.");
                }
            },
            () => {

            }
        );
    };

    const toggleView = () => {
        const newView = view === 'active' ? 'deleted' : 'active';
        setView(newView);
        if (newView === 'active') {
            fetchActiveEmployees();
        } else {
            fetchDeletedEmployees();
        }
    };
    
    // --- Renderizado ---
    if (authLoading || !isInitialized) {
        return <p className="p-6 text-gray-600">Cargando información...</p>;
    }

    if (!user || !hasRole('admin')) {
        return <p className="text-red-500 p-6">Acceso restringido. Debes ser administrador.</p>;
    }

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-secondary">Dashboard</h1>
            <ReportsSlider />
            <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold mb-6 text-secondary">
                        {view === 'active' ? 'Gestión de Empleados' : 'Empleados Eliminados'}
                    </h2>
                    <button
                        onClick={toggleView}
                        className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 transition-colors cursor-pointer"
                    >
                        {view === 'active' ? <UserX size={18} /> : <Users size={18} />}
                        <span>{view === 'active' ? 'Ver Eliminados' : 'Ver Activos'}</span>
                    </button>
                </div>
                
                {loadingData ? (
                    <p>Cargando tabla...</p>
                ) : (
                    view === 'active' ? (
                        <TableEmployee
                            employees={employees}
                            rolesDisponibles={roles}
                            onDelete={handleDelete}
                            refreshEmployees={fetchActiveEmployees}
                        />
                    ) : (
                        <DeletedEmployeesTable
                            employees={deletedEmployees}
                            onRestore={handleRestore}
                        />
                    )
                )}
            </div>
        </main>
    );
};