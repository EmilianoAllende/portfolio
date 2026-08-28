import api from '@/lib/axiosInstance';

export const fetchSalesByEmployee = async (startDate: string, endDate: string) => {
    const res = await api.get(`/dashboard/sales-by-employee`, {
        params: { startDate, endDate },
    });
    return res.data;
};


export const fetchMonthlySales = async (year: number) => {
    const res = await api.get(`/dashboard/monthly-sales`, {
        params: { year },
    });
    return res.data;
};

export const fetchFinancialSummary = async (startDate: string, endDate: string) => {
    const res = await api.get(`/dashboard/financial-summary`, {
        params: { startDate, endDate },
    });
    return res.data;
};