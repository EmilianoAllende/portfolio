'use client';

import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import ChartCard from '../components/ChartCard';
import { ApexOptions } from 'apexcharts';
import { fetchMonthlySales } from '@/hooks/metrics';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function SalesChart() {
    const [categories, setCategories] = useState<string[]>([]);
    const [seriesData, setSeriesData] = useState<number[]>([]);

    useEffect(() => {
        const year = new Date().getFullYear();

        fetchMonthlySales(year).then(data => {
            if (!Array.isArray(data)) {
                console.error('Esperaba un array, pero recibí:', data);
                return;
            }

            const completeData = Array(12).fill(0);
            data.forEach((item: any) => {
                completeData[item.month - 1] = item.totalSales;
            });
            setCategories(monthLabels);
            setSeriesData(completeData);
        });
    }, []);

    const options: ApexOptions = {
        chart: { type: 'area', toolbar: { show: false }, foreColor: '#b8b9ba' },
        xaxis: { categories },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        colors: ['#3b82f6'],
    };

    const series = [{ name: 'Ventas totales', data: seriesData }];

    return (
        <ChartCard title="Ventas Totales en $">
            <Chart options={options} series={series} type="area" height="100%" />
        </ChartCard>
    );
};