'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { ButtonPrimary } from '@/components/UI/Buttons/Buttons';
import toast from 'react-hot-toast';
import { routes } from '@/app/routes';

interface CancellationReason {
    id: string;
    reason: string;
}

export default function CancelOrderPage() {
    const router = useRouter();
    const params = useSearchParams();
    const orderId = params.get('id') || '';
    const [reasons, setReasons] = useState<CancellationReason[]>([]);
    const [selectedReasonId, setSelectedReasonId] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        api
        .get('/cancellation-reasons') // <- CORREGIDO
        .then((res) => setReasons(res.data))
        .catch(() => toast.error('No se pudieron cargar los motivos.'));
    }, []);


    const handleCancelOrder = async () => {
        if (!selectedReasonId) {
        toast.error('Seleccioná un motivo.');
        return;
        }

        try {
        await api.delete(`/orders/${orderId}`, {
            data: {
            cancellation_reason_id: selectedReasonId,
            comment,
            },
        });

        toast.success('Orden cancelada correctamente.');
        router.push(routes.user.reportsemployee);
        } catch (error) {
        toast.error('Error al cancelar la orden.');
        console.error(error);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-6 border rounded shadow bg-white">
        <h2 className="text-xl font-bold mb-4">Cancelar Orden</h2>

        <div className="mb-4">
            <label className="block mb-2 font-medium">Motivo de cancelación</label>
            <select
            className="w-full border px-3 py-2 rounded"
            value={selectedReasonId}
            onChange={(e) => setSelectedReasonId(e.target.value)}
            >
            <option value="">Seleccioná una opción</option>
            {reasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                {reason.reason}
                </option>
            ))}
            </select>
        </div>

        <div className="mb-4">
            <label className="block mb-2 font-medium">Comentario (opcional)</label>
            <textarea
            className="w-full border px-3 py-2 rounded"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            />
        </div>

        <div className="flex justify-end gap-2">
            <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
            Cancelar
            </button>
            <ButtonPrimary onClick={handleCancelOrder} textContent="Confirmar Cancelación" />
        </div>
        </div>
    );
};