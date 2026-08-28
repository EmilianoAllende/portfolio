import { useState, useCallback, useEffect } from "react";
import apiClient from "../api/apiClient";

const generateSecurePassword = () => {
	const charset =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
	let newPass = "";
	for (let i = 0; i < 14; i++) {
		newPass += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return newPass;
};

export const useUserManagement = ({
	currentUser,
	setNotification,
	setConfirmProps,
	closeConfirm,
}) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isActionLoading, setIsActionLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showResetModal, setShowResetModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const adminToken = currentUser?.token;

	const fetchUsers = useCallback(async () => {
		console.log("fetchUsers called, adminToken:", adminToken);
		if (!adminToken) {
			console.log("No adminToken, returning");
			return;
		}
		setIsLoading(true);
		try {
			const response = await apiClient.getUsers(adminToken);
			console.log("Response from getUsers:", response);
            let usersData = response.data;
            console.log("usersData:", usersData);
            let finalUsers = [];
            if (Array.isArray(usersData)) {
                if (usersData[0] && usersData[0].json) {
                    finalUsers = usersData.map(item => item.json);
                } else {
                    finalUsers = usersData;
                }
            } else if (usersData && Array.isArray(usersData.data)) {
                finalUsers = usersData.data;
            } else if (usersData && typeof usersData === 'object' && usersData.id) {
                // Si es un objeto con id y rol, tratarlo como array de uno
                finalUsers = [usersData];
            } else {
                finalUsers = [];
            }
			console.log("finalUsers:", finalUsers);
			setUsers(finalUsers);
		} catch (err) {
			console.error("Error al obtener usuarios:", err);
			setNotification({
				type: "error",
				title: "Error",
				message: "No se pudo cargar la lista de usuarios.",
			});
		} finally {
			setIsLoading(false);
		}
	}, [adminToken, setNotification]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleCreateUser = useCallback(async (usuario, password, rol) => {
		setIsActionLoading(true);
		try {
			const response = await apiClient.createUser(usuario, password, rol, adminToken);
			if (response.data && response.data.status === "success") {
				setNotification({
					type: "success",
					title: "Usuario Creado",
					message: response.data.message || `Usuario ${usuario} creado exitosamente.`,
				});
				setShowCreateModal(false);
				fetchUsers();
			} else {
				throw new Error(response.data.message || "Error desconocido");
			}
		} catch (err) {
			console.error("Error al crear usuario:", err);
			setNotification({
				type: "error",
				title: "Error",
				message: err.response?.data?.message || err.message || "No se pudo crear el usuario.",
			});
		} finally {
			setIsActionLoading(false);
		}
	}, [adminToken, setNotification, fetchUsers]);

	const handleResetPassword = useCallback(async (usuario, newPassword) => {
		setIsActionLoading(true);
		try {
			const response = await apiClient.resetUserPassword(usuario, newPassword, adminToken);
			if (response.data) {
				setNotification({
					type: "success",
					title: "Contraseña Actualizada",
					message: `La contraseña para ${usuario} se ha actualizado correctamente.`,
				});
				setShowResetModal(false);
				setSelectedUser(null);
			}
		} catch (err) {
			console.error("Error al resetear contraseña:", err);
			setNotification({
				type: "error",
				title: "Error",
				message: "No se pudo resetear la contraseña.",
			});
		} finally {
			setIsActionLoading(false);
		}
	}, [adminToken, setNotification]);

	const handleDeleteUser = useCallback((usuario) => {
        setConfirmProps({
            show: true,
            title: "Confirmar Eliminación",
            message: `¿Estás seguro de que quieres eliminar al usuario "${usuario}"?  Esta acción no se puede deshacer.`,
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
            type: "danger",
            onConfirm: async () => {
                closeConfirm();
                setIsActionLoading(true);
                try {
                    const response = await apiClient.deleteUser(usuario, adminToken);
                    if (response.data) {
                        setNotification({
                            type: "success",
                            title: "Usuario Eliminado",
                            message: `El usuario ${usuario} ha sido eliminado.`,
                        });
                        fetchUsers();
                    }
                } catch (err) {
                    console.error("Error al eliminar usuario:", err);
                    setNotification({
                        type: "error",
                        title: "Error",
                        message: "No se pudo eliminar el usuario.",
                    });
                } finally {
                    setIsActionLoading(false);
                }
            },
        });
	}, [adminToken, setConfirmProps, closeConfirm, setNotification, fetchUsers]);

	const openResetModal = (usuario) => {
		setSelectedUser(usuario);
		setShowResetModal(true);
	};

	return {
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
	};
};
