import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

export function ResultsCharts({ results }) {
  const { projections } = results;

  const chartData = projections.map(p => ({
    year: p.year,
    sde: p.sde,
    totalDebtService: p.totalDebtService,
    sellerEarnoutPayment: p.sellerEarnoutPayment,
    netCashFlow: p.netCashFlow,
    dscr: p.dscr,
    sbaBalance: p.sbaBalance,
    sellerNoteBalance: p.sellerNoteBalance,
    otherLoanBalance: p.otherLoanBalance,
    sellerEarnoutBalance: p.sellerEarnoutBalance
  }));

  return (
    <div className="space-y-8">
      {/* SDE Allocation Stacked Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Annual SDE Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="totalDebtService" stackId="a" fill="#EF4444" name="Total Debt Service" />
            <Bar dataKey="sellerEarnoutPayment" stackId="a" fill="#F97316" name="Seller Earnout" />
            <Bar dataKey="netCashFlow" stackId="a" fill="#10B981" name="Net Cash Flow" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Flow vs Debt Service */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash Flow vs Debt Service</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sde" 
              stroke="#10B981" 
              strokeWidth={3}
              name="SDE"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalDebtService" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Total Debt Service"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="netCashFlow" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Net Cash Flow"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* DSCR Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Debt Service Coverage Ratio (DSCR)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => value.toFixed(2)} />
            <Legend />
            <ReferenceLine y={1.25} stroke="#10B981" strokeDasharray="5 5" label="Healthy DSCR (1.25)" />
            <ReferenceLine y={1.0} stroke="#F97316" strokeDasharray="5 5" label="Break-even (1.0)" />
            <Line 
              type="monotone" 
              dataKey="dscr" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              name="DSCR"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Loan Balances Over Time */}
      {projections.some(p => p.sbaBalance > 0 || p.sellerNoteBalance > 0 || p.otherLoanBalance > 0 || p.sellerEarnoutBalance > 0) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Balances Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              {projections.some(p => p.sbaBalance > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="sbaBalance" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="SBA Loan Balance"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                />
              )}
              {projections.some(p => p.sellerNoteBalance > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="sellerNoteBalance" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Seller Note Balance"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              )}
              {projections.some(p => p.otherLoanBalance > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="otherLoanBalance" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Other Loan Balance"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                />
              )}
              {projections.some(p => p.sellerEarnoutBalance > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="sellerEarnoutBalance" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  name="Seller Earnout Balance"
                  dot={{ fill: '#F97316', strokeWidth: 2, r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}