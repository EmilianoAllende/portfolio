'use client';

import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import ChartCard from '../components/ChartCard';
import { ApexOptions } from 'apexcharts';
import { fetchFinancialSummary } from '@/hooks/metrics';

export default function IncomeVsExpenseChart() {
    const [income, setIncome] = useState<number[]>([]);
    const [expenses, setExpenses] = useState<number[]>([]);

    useEffect(() => {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);

        const format = (d: Date) => d.toISOString().split('T')[0];

        fetchFinancialSummary(format(monthAgo), format(today)).then(data => {
            setIncome([data.totalRevenue]);
            setExpenses([data.totalCostOfGoodsSold]);
        });
    }, []);

    const options: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false }, foreColor: '#b8b9ba' },
        xaxis: { categories: ['Últimos 30 días'] },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
        colors: ['#10b981', '#ef4444'],
    };

    const series = [
        { name: 'Ingresos', data: income },
        { name: 'Egresos', data: expenses },
    ];

    return (
        <ChartCard title="Ingresos vs Egresos">
            <Chart options={options} series={series} type="bar" height="100%" />
        </ChartCard>
    );
};