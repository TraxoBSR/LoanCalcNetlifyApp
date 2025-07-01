import React from 'react';
import { Trash2, DollarSign } from 'lucide-react';
import { InputField } from './InputField';
import { formatCurrency } from '../utils/calculations';

export function FundingSourceCard({
  source,
  onUpdate,
  onRemove,
  businessPrice,
  remainingAmount
}) {
  const updateField = (field, value) => {
    const updatedSource = { ...source, [field]: value };
    
    // Auto-calculate amount from percentage or vice versa
    if (field === 'percentage') {
      updatedSource.amount = (businessPrice * value) / 100;
    } else if (field === 'amount') {
      updatedSource.percentage = businessPrice > 0 ? (value / businessPrice) * 100 : 0;
    }
    
    onUpdate(updatedSource);
  };

  const getDefaultValues = () => {
    switch (source.type) {
      case 'sba':
        return { term: 10, interestRate: 10.25 };
      case 'seller_note':
        return { term: 5, interestRate: 6.0 };
      case 'other_loan':
        return { term: 7, interestRate: 8.0 };
      case 'seller_earnout':
        return { term: 3, interestRate: 0 };
      default:
        return {};
    }
  };

  const defaults = getDefaultValues();

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className={
            source.type === 'seller_earnout' ? 'text-orange-600' : 'text-blue-600'
          } />
          <h3 className="font-semibold text-gray-800">{source.name}</h3>
        </div>
        {source.type !== 'down_payment' && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Amount"
          value={source.amount.toString()}
          onChange={(value) => updateField('amount', parseFloat(value) || 0)}
          type="number"
          prefix="$"
          min={0}
          tooltip={source.type === 'seller_earnout' 
            ? "Total earnout amount to be paid over the term" 
            : "The dollar amount for this funding source"
          }
        />
        
        <InputField
          label="Percentage"
          value={source.percentage.toFixed(1)}
          onChange={(value) => updateField('percentage', parseFloat(value) || 0)}
          type="number"
          suffix="%"
          min={0}
          max={100}
          step={0.1}
          tooltip="Percentage of total business price"
        />

        {source.type !== 'down_payment' && (
          <>
            <InputField
              label={source.type === 'seller_earnout' ? 'Earnout Term (Years)' : 'Term (Years)'}
              value={source.term?.toString() || defaults.term?.toString() || '10'}
              onChange={(value) => updateField('term', parseInt(value) || 10)}
              type="number"
              min={1}
              max={30}
              tooltip={source.type === 'seller_earnout' 
                ? "Number of years over which earnout will be paid" 
                : "Loan term in years"
              }
            />
            
            {source.type !== 'seller_earnout' && (
              <InputField
                label="Interest Rate"
                value={source.interestRate?.toString() || defaults.interestRate?.toString() || '0'}
                onChange={(value) => updateField('interestRate', parseFloat(value) || 0)}
                type="number"
                suffix="%"
                min={0}
                max={50}
                step={0.01}
                tooltip="Annual interest rate"
              />
            )}
          </>
        )}
      </div>

      {/* Seller Earnout specific fields */}
      {source.type === 'seller_earnout' && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700">Earnout Structure</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`earnoutType_${source.id}`}
                checked={source.earnoutType === 'fixed'}
                onChange={() => updateField('earnoutType', 'fixed')}
              />
              <span className="text-sm">Fixed amount per year</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`earnoutType_${source.id}`}
                checked={source.earnoutType === 'percentage'}
                onChange={() => updateField('earnoutType', 'percentage')}
              />
              <span className="text-sm">% of SDE</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`earnoutType_${source.id}`}
                checked={source.earnoutType === 'conditional'}
                onChange={() => updateField('earnoutType', 'conditional')}
              />
              <span className="text-sm">Conditional</span>
            </label>
          </div>

          {source.earnoutType === 'percentage' && (
            <InputField
              label="Percentage of SDE"
              value={source.earnoutPercentage?.toString() || '0'}
              onChange={(value) => updateField('earnoutPercentage', parseFloat(value) || 0)}
              type="number"
              suffix="%"
              min={0}
              max={100}
              step={0.1}
              tooltip="Percentage of annual SDE to pay as earnout"
            />
          )}

          {source.earnoutType === 'conditional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="SDE Threshold"
                value={source.earnoutThreshold?.toString() || '0'}
                onChange={(value) => updateField('earnoutThreshold', parseFloat(value) || 0)}
                type="number"
                prefix="$"
                min={0}
                tooltip="Minimum SDE required to trigger earnout payment"
              />
              <InputField
                label="Annual Earnout Amount"
                value={(source.amount / (source.term || 1)).toString()}
                onChange={(value) => {
                  const annualAmount = parseFloat(value) || 0;
                  updateField('amount', annualAmount * (source.term || 1));
                }}
                type="number"
                prefix="$"
                min={0}
                tooltip="Amount paid per year when threshold is met"
              />
            </div>
          )}

          <InputField
            label="Total Earnout Cap (Optional)"
            value={source.earnoutCap?.toString() || ''}
            onChange={(value) => updateField('earnoutCap', value ? parseFloat(value) : undefined)}
            type="number"
            prefix="$"
            min={0}
            tooltip="Maximum total earnout that can be paid over all years"
          />
        </div>
      )}

      {source.type !== 'down_payment' && source.type !== 'sba' && source.type !== 'seller_earnout' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={source.isInterestOnly || false}
              onChange={(e) => updateField('isInterestOnly', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Interest-only period</span>
          </label>
          
          {source.isInterestOnly && (
            <InputField
              label="Interest-only Period (Years)"
              value={source.interestOnlyPeriod?.toString() || '0'}
              onChange={(value) => updateField('interestOnlyPeriod', parseInt(value) || 0)}
              type="number"
              min={0}
              max={source.term || 10}
              tooltip="Number of years with interest-only payments"
            />
          )}
        </div>
      )}

      {source.type === 'down_payment' && remainingAmount !== 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          Remaining to allocate: {formatCurrency(remainingAmount)}
        </div>
      )}

      {source.type === 'seller_earnout' && (
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
          <strong>Note:</strong> Earnout is only paid if there's sufficient cash flow after all debt service payments.
        </div>
      )}
    </div>
  );
}