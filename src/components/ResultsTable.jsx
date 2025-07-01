import React from 'react';
import { formatCurrency } from '../utils/calculations';

export function ResultsTable({ results }) {
  const { projections } = results;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">10-Year Financial Projections</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                Metric
              </th>
              {projections.map(p => (
                <th key={p.year} className="px-4 py-3 text-center font-medium text-gray-700 min-w-[100px]">
                  Year {p.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-green-50">
              <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-green-50 z-10">
                SDE
              </td>
              {projections.map(p => (
                <td key={p.year} className="px-4 py-3 text-center font-medium text-green-700">
                  {formatCurrency(p.sde)}
                </td>
              ))}
            </tr>
            
            {projections.some(p => p.sbaPayment > 0) && (
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white z-10">
                  SBA Loan Payment
                </td>
                {projections.map(p => (
                  <td key={p.year} className="px-4 py-3 text-center text-gray-600">
                    {p.sbaPayment > 0 ? formatCurrency(p.sbaPayment) : '-'}
                  </td>
                ))}
              </tr>
            )}
            
            {projections.some(p => p.sellerNotePayment > 0) && (
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white z-10">
                  Seller Note Payment
                </td>
                {projections.map(p => (
                  <td key={p.year} className="px-4 py-3 text-center text-gray-600">
                    {p.sellerNotePayment > 0 ? formatCurrency(p.sellerNotePayment) : '-'}
                  </td>
                ))}
              </tr>
            )}
            
            {projections.some(p => p.otherLoanPayment > 0) && (
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white z-10">
                  Other Loan Payment
                </td>
                {projections.map(p => (
                  <td key={p.year} className="px-4 py-3 text-center text-gray-600">
                    {p.otherLoanPayment > 0 ? formatCurrency(p.otherLoanPayment) : '-'}
                  </td>
                ))}
              </tr>
            )}
            
            <tr className="bg-red-50">
              <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-red-50 z-10">
                Total Debt Service
              </td>
              {projections.map(p => (
                <td key={p.year} className="px-4 py-3 text-center font-medium text-red-700">
                  {formatCurrency(p.totalDebtService)}
                </td>
              ))}
            </tr>
            
            {projections.some(p => p.sellerEarnoutPayment > 0) && (
              <tr className="bg-orange-50">
                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-orange-50 z-10">
                  Seller Earnout Payment
                </td>
                {projections.map(p => (
                  <td key={p.year} className="px-4 py-3 text-center font-medium text-orange-700">
                    {p.sellerEarnoutPayment > 0 ? formatCurrency(p.sellerEarnoutPayment) : '-'}
                  </td>
                ))}
              </tr>
            )}
            
            <tr className="bg-blue-50">
              <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-blue-50 z-10">
                Net Cash Flow
              </td>
              {projections.map(p => (
                <td key={p.year} className={`px-4 py-3 text-center font-medium ${
                  p.netCashFlow >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {formatCurrency(p.netCashFlow)}
                </td>
              ))}
            </tr>
            
            <tr className="bg-purple-50">
              <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-purple-50 z-10">
                DSCR
              </td>
              {projections.map(p => (
                <td key={p.year} className={`px-4 py-3 text-center font-medium ${
                  p.dscr >= 1.25 ? 'text-green-700' : p.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-700'
                }`}>
                  {p.dscr > 0 ? p.dscr.toFixed(2) : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}