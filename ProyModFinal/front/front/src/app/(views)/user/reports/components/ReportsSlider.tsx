'use client';

import React from 'react';
import SalesChart from './SalesChart';
import IncomeVsExpenseChart from './IncomeVsExpenseChart';
import EmployeeComparisonChart from './EmployeeComparisonChart';

export default function ReportsSlider() {
  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 min-w-max">
        <SalesChart />
        <IncomeVsExpenseChart />
        <EmployeeComparisonChart />
      </div>
      
    </div>
  );
};