import React, { useState, useEffect } from 'react';
import { Plus, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { InputField } from './InputField';
import { FundingSourceCard } from './FundingSourceCard';
import { validateFundingSources, formatCurrency } from '../utils/calculations';

export function BusinessInputForm({ onSubmit, loading = false, error }) {
  const [businessPrice, setBusinessPrice] = useState(0);
  const [fundingSources, setFundingSources] = useState([]);
  const [sdeForecast, setSdeForecast] = useState({
    type: 'single',
    baseAmount: 0
  });
  const [yearlyAmounts, setYearlyAmounts] = useState(Array(10).fill(0));

  // Initialize down payment funding source
  useEffect(() => {
    if (fundingSources.length === 0) {
      const downPayment = {
        id: 'down_payment',
        type: 'down_payment',
        name: 'Down Payment',
        amount: 0,
        percentage: 0
      };
      setFundingSources([downPayment]);
    }
  }, []);

  // Update down payment when other sources change
  useEffect(() => {
    if (businessPrice > 0) {
      const otherSources = fundingSources.filter(s => s.type !== 'down_payment');
      const otherTotal = otherSources.reduce((sum, s) => sum + s.amount, 0);
      const downPaymentAmount = Math.max(0, businessPrice - otherTotal);
      const downPaymentPercentage = businessPrice > 0 ? (downPaymentAmount / businessPrice) * 100 : 0;

      setFundingSources(prev => 
        prev.map(source => 
          source.type === 'down_payment'
            ? { ...source, amount: downPaymentAmount, percentage: downPaymentPercentage }
            : source
        )
      );
    }
  }, [businessPrice, fundingSources.filter(s => s.type !== 'down_payment')]);

  const addFundingSource = (type) => {
    const names = {
      sba: 'SBA Loan',
      seller_note: 'Seller Note',
      other_loan: 'Other Loan',
      seller_earnout: 'Seller Earnout'
    };

    const newSource = {
      id: `${type}_${Date.now()}`,
      type,
      name: names[type],
      amount: 0,
      percentage: 0,
      term: type === 'sba' ? 10 : type === 'seller_note' ? 5 : type === 'other_loan' ? 7 : type === 'seller_earnout' ? 3 : 7,
      interestRate: type === 'sba' ? 10.25 : type === 'seller_note' ? 6.0 : type === 'other_loan' ? 8.0 : 0,
      isInterestOnly: false,
      earnoutType: type === 'seller_earnout' ? 'fixed' : undefined
    };

    setFundingSources(prev => [...prev, newSource]);
  };

  const updateFundingSource = (id, updatedSource) => {
    setFundingSources(prev =>
      prev.map(source => source.id === id ? updatedSource : source)
    );
  };

  const removeFundingSource = (id) => {
    setFundingSources(prev => prev.filter(source => source.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateFundingSources(fundingSources, businessPrice)) {
      alert('Funding sources must total 100% of the business price');
      return;
    }

    const finalSdeForecast = {
      ...sdeForecast,
      yearlyAmounts: sdeForecast.type === 'yearly' ? yearlyAmounts : undefined
    };

    onSubmit({
      businessPrice,
      fundingSources,
      sdeForecast: finalSdeForecast
    });
  };

  const totalAllocated = fundingSources.reduce((sum, source) => sum + source.amount, 0);
  const remainingAmount = businessPrice - totalAllocated;
  const isValid = Math.abs(remainingAmount) < 1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        <div className="text-center space-y-2">
          <Building size={48} className="mx-auto text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Business Loan Calculator</h1>
          <p className="text-gray-600">Configure your business purchase and financing structure</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Calculation Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Price */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Purchase Details</h2>
            <InputField
              label="Business Purchase Price"
              value={businessPrice.toString()}
              onChange={(value) => setBusinessPrice(parseFloat(value) || 0)}
              type="number"
              prefix="$"
              min={0}
              required
              tooltip="Total purchase price of the business"
            />
          </div>

          {/* Funding Sources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Funding Sources</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => addFundingSource('sba')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} /> SBA Loan
                </button>
                <button
                  type="button"
                  onClick={() => addFundingSource('seller_note')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} /> Seller Note
                </button>
                <button
                  type="button"
                  onClick={() => addFundingSource('other_loan')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} /> Other Loan
                </button>
                <button
                  type="button"
                  onClick={() => addFundingSource('seller_earnout')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  <Plus size={16} /> Seller Earnout
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {fundingSources.map(source => (
                <FundingSourceCard
                  key={source.id}
                  source={source}
                  onUpdate={(updatedSource) => updateFundingSource(source.id, updatedSource)}
                  onRemove={() => removeFundingSource(source.id)}
                  businessPrice={businessPrice}
                  remainingAmount={remainingAmount}
                />
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Total Allocated: {formatCurrency(totalAllocated)}</span>
                <span>Business Price: {formatCurrency(businessPrice)}</span>
                <span className={remainingAmount === 0 ? 'text-green-600' : 'text-amber-600'}>
                  Remaining: {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* SDE Forecast */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={24} className="text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">SDE Forecast</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sdeType"
                    checked={sdeForecast.type === 'single'}
                    onChange={() => setSdeForecast({ type: 'single', baseAmount: 0 })}
                  />
                  <span className="text-sm">Single amount for all years</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sdeType"
                    checked={sdeForecast.type === 'growth'}
                    onChange={() => setSdeForecast({ type: 'growth', baseAmount: 0, growthRate: 0 })}
                  />
                  <span className="text-sm">Year 1 + annual growth</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sdeType"
                    checked={sdeForecast.type === 'yearly'}
                    onChange={() => setSdeForecast({ type: 'yearly' })}
                  />
                  <span className="text-sm">Separate amount per year</span>
                </label>
              </div>

              {sdeForecast.type === 'single' && (
                <InputField
                  label="Annual SDE"
                  value={sdeForecast.baseAmount?.toString() || '0'}
                  onChange={(value) => setSdeForecast(prev => ({ ...prev, baseAmount: parseFloat(value) || 0 }))}
                  type="number"
                  prefix="$"
                  min={0}
                  tooltip="Seller's Discretionary Earnings for all years"
                />
              )}

              {sdeForecast.type === 'growth' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Year 1 SDE"
                    value={sdeForecast.baseAmount?.toString() || '0'}
                    onChange={(value) => setSdeForecast(prev => ({ ...prev, baseAmount: parseFloat(value) || 0 }))}
                    type="number"
                    prefix="$"
                    min={0}
                    tooltip="SDE for the first year"
                  />
                  <InputField
                    label="Annual Growth Rate"
                    value={sdeForecast.growthRate?.toString() || '0'}
                    onChange={(value) => setSdeForecast(prev => ({ ...prev, growthRate: parseFloat(value) || 0 }))}
                    type="number"
                    suffix="%"
                    min={-50}
                    max={100}
                    step={0.1}
                    tooltip="Expected annual growth rate"
                  />
                </div>
              )}

              {sdeForecast.type === 'yearly' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }, (_, i) => (
                    <InputField
                      key={i}
                      label={`Year ${i + 1}`}
                      value={yearlyAmounts[i]?.toString() || '0'}
                      onChange={(value) => {
                        const newAmounts = [...yearlyAmounts];
                        newAmounts[i] = parseFloat(value) || 0;
                        setYearlyAmounts(newAmounts);
                      }}
                      type="number"
                      prefix="$"
                      min={0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isValid || businessPrice <= 0}
            className={`
              w-full py-3 px-6 rounded-lg text-white font-semibold text-lg
              transition-all duration-200 flex items-center justify-center gap-2
              ${isValid && businessPrice > 0 && !loading
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Calculating...
              </>
            ) : (
              'Calculate Projections'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}