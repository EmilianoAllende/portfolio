import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
    return (
        <div className="min-w-[300px] max-w-sm bg-secondary rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-200 dark:text-white mb-2">{title}</h2>
            <div className="h-64 text-base-100">{children}</div>
        </div>
    );
};