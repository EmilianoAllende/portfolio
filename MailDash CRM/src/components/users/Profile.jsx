import React, { useMemo, useState } from "react";
import { UserCircle, KeyRound, Save, Eye, EyeOff } from "lucide-react";
import apiClient from "../../api/apiClient";

const Profile = ({ currentUser, setNotification }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const displayUserName = useMemo(
        () => currentUser?.usuario || currentUser?.username || currentUser?.name || currentUser?.id || "Usuario Desconocido",
        [currentUser]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            setNotification({
                type: "warning",
                title: "Campo Requerido",
                message: "Por favor ingresa una nueva contraseña.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setNotification({
                type: "warning",
                title: "Contraseñas no coinciden",
                message: "Asegúrate de repetir la misma contraseña en ambos campos.",
            });
            return;
        }

        setIsSaving(true);
        try {
            // El backend deberá ser notificado que es un self reset, ya que el adminToken real
            // puede que no lo tenga si el usuario es "user". Enviaremos el currentUser.token por si acaso,
            // y activaremos la bandera isSelfReset = true.
            const tokenToUse = currentUser?.token || "self-reset-token";

            const response = await apiClient.resetUserPassword(
                displayUserName,
                newPassword,
                tokenToUse,
                true // isSelfReset
            );

            if (response.data) {
                setNotification({
                    type: "success",
                    title: "Perfil Actualizado",
                    message: "Tu contraseña ha sido actualizada exitosamente.",
                });
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            console.error("Error al actualizar la contraseña:", err);
            setNotification({
                type: "error",
                title: "Error de Actualización",
                message: err.message || "No se pudo actualizar la contraseña. Revisa tu conexión o contacta a soporte.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto flex flex-col min-h-full">
            <div className="flex flex-col mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md">
                        <UserCircle size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mi Perfil
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Modifica tus credenciales y preferencias de acceso.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">

                {/* Columna de Información del Usuario */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold uppercase mb-4 shadow-sm">
                        {displayUserName.substring(0, 2) || "U"}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center break-all">
                        {displayUserName}
                    </h2>
                    <span className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wide
                        ${currentUser?.rol === 'superadmin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                            currentUser?.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {currentUser?.rol || "user"}
                    </span>
                </div>

                {/* Columna de Formulario de Cambio de Contraseña */}
                <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-6">
                        <KeyRound size={20} className="text-slate-500" />
                        Cambiar Contraseña
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 pr-12 transition-all"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? "Guardando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Profile;
