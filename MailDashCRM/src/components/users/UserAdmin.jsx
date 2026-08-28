import React from "react";
import { ShieldCheck, UserPlus, Key, Trash2, RefreshCw } from "lucide-react";
import { useUserManagement } from "../../hooks/useUserManagement";
import CreateUserModal from "./CreateUserModal";
import ResetPasswordModal from "./ResetPasswordModal";

const UserAdmin = (props) => {
	const {
		users,
		isLoading,
		isActionLoading,
		showCreateModal,
		setShowCreateModal,
		showResetModal,
		setShowResetModal,
		selectedUser,
		handleCreateUser,
		handleResetPassword,
		handleDeleteUser,
		openResetModal,
		generateSecurePassword,
		fetchUsers
	} = useUserManagement(props);

	const currentUser = props.currentUser;

	console.log("UserAdmin currentUser:", currentUser);
	console.log("UserAdmin users:", users);
	console.log("UserAdmin isLoading:", isLoading);

	// Determina si el usuario logueado puede editar/borrar al usuario de la fila
	const canPerformAction = (targetRol) => {
		const can = currentUser?.rol === "superadmin" || (currentUser?.rol === "admin" && targetRol === "user");
		console.log(`canPerformAction for targetRol ${targetRol}:`, can, "currentUser.rol:", currentUser?.rol);
		return can;
	};

	return (
		<div className="p-8 max-w-6xl mx-auto flex flex-col min-h-full">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-blue-600 rounded-xl text-white shadow-md">
						<ShieldCheck size={28} />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
							Gestión de Usuarios
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Administra los accesos y credenciales de los usuarios vinculados al sistema.
						</p>
					</div>
				</div>
				<div className="flex gap-3">
					<button
						onClick={fetchUsers}
						className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
					>
						<RefreshCw size={18} className={isLoading ? "animate-spin text-blue-500" : ""} />
						Recargar
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-medium"
					>
						<UserPlus size={18} />
						Nuevo Usuario
					</button>
				</div>
			</div>

			<div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
								<th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
									Usuario
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
									Rol
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200 dark:divide-slate-700">
							{console.log("Rendering table, users:", users)}
							{isLoading ? (
								<tr>
									<td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
										Cargando usuarios...
									</td>
								</tr>
							) : users.length === 0 ? (
								<tr>
									<td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
										No se encontraron usuarios.
									</td>
								</tr>
							) : (
								users.map((u) => {
									console.log("User:", u, "canPerformAction:", canPerformAction(u.rol));
									return (
									<tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
													{u.id.substring(0, 2)}
												</div>
												<span className="font-medium text-slate-900 dark:text-slate-100">
													{u.id}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.rol === 'superadmin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : u.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
												{u.rol}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end gap-2">
												{canPerformAction(u.rol) && (
													<>
														<button
															onClick={() => openResetModal(u.id)}
															className="p-2 text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600 rounded-lg shadow-sm transition-all"
															title="Resetear Contraseña"
														>
															<Key size={16} />
														</button>
														{currentUser?.id !== u.id && (
															<button
																onClick={() => handleDeleteUser(u.id)}
																className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600 rounded-lg shadow-sm transition-all"
																title="Eliminar Usuario"
															>
																<Trash2 size={16} />
															</button>
														)}
													</>
												)}
											</div>
										</td>
									</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			<CreateUserModal
				show={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreate={handleCreateUser}
				isSaving={isActionLoading}
				generatePassword={generateSecurePassword}
			/>

			<ResetPasswordModal
				show={showResetModal}
				onClose={() => setShowResetModal(false)}
				onReset={handleResetPassword}
				isSaving={isActionLoading}
				generatePassword={generateSecurePassword}
				usuario={selectedUser}
			/>
		</div>
	);
};

export default UserAdmin;
