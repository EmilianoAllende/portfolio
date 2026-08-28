import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, KeyRound, X } from "lucide-react";

const CreateUserModal = ({ show, onClose, onCreate, isSaving, generatePassword, currentUser }) => {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [rol, setRol] = useState("user");
    const [showPassword, setShowPassword] = useState(false);

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(usuario, password, rol);
    };

    const handleGenPass = () => {
        const newPass = generatePassword();
        setPassword(newPass);
        setShowPassword(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <UserPlus size={20} className="text-blue-600 dark:text-blue-400" />
                        Nuevo Usuario
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Nombre de Usuario
                            </label>
                            <input
                                type="text"
                                required
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder="ej. juan.perez"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 pr-20"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-10 flex items-center text-slate-400 hover:text-blue-500"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenPass}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    <KeyRound size={18} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Rol del Usuario
                            </label>
                            <select
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                disabled={currentUser?.rol !== 'superadmin'}
                            >
                                <option value="user">Usuario (user)</option>
                                {currentUser?.rol === 'superadmin' && (
                                    <>
                                        <option value="admin">Administrador (admin)</option>
                                        <option value="superadmin">Superadministrador (superadmin)</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50">
                                {isSaving ? "Guardando..." : "Crear Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateUserModal;
