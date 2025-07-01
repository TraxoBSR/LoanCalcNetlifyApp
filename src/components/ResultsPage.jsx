import React, { useState } from 'react';
import { Download, ArrowLeft, TrendingUp, DollarSign, Target, PieChart, AlertCircle, Mail, User } from 'lucide-react';
import { ResultsTable } from './ResultsTable';
import { ResultsCharts } from './ResultsCharts';
import { InputField } from './InputField';
import { formatCurrency } from '../utils/calculations';

export function ResultsPage({
  results,
  userData,
  inputs,
  onBack,
  onRequestReport,
  reportRequested,
  reportLoading = false,
  reportError
}) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const { summary, projections } = results;
  const minDSCR = Math.min(...projections.map(p => p.dscr).filter(d => d > 0));
  const avgNetCashFlow = summary.totalNetCashFlow / 10;

  const keyMetrics = [
    {
      icon: DollarSign,
      label: 'Total SDE (10 years)',
      value: formatCurrency(summary.totalSDE),
      color: 'text-green-600'
    },
    {
      icon: Target,
      label: 'Average Net Cash Flow',
      value: formatCurrency(avgNetCashFlow),
      color: avgNetCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'
    },
    {
      icon: TrendingUp,
      label: 'Average DSCR',
      value: summary.averageDSCR.toFixed(2),
      color: summary.averageDSCR >= 1.25 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      icon: PieChart,
      label: 'Total Debt Service',
      value: formatCurrency(summary.totalDebtService),
      color: 'text-red-600'
    }
  ];

  const handleEmailFormSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      // Update the request with real user data
      const realUserData = { name: name.trim(), email: email.trim() };
      onRequestReport(realUserData);
      setShowEmailForm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Inputs
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Business Loan Analysis</h1>
            <p className="text-gray-600 mt-1">
              Business Price: {formatCurrency(inputs.businessPrice)}
            </p>
          </div>

          <button
            onClick={() => setShowEmailForm(true)}
            disabled={reportRequested || reportLoading}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
              transition-all duration-200
              ${reportRequested
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : reportLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {reportLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Download size={20} />
                {reportRequested ? 'Report Sent!' : 'Email Me Results'}
              </>
            )}
          </button>
        </div>

        {reportError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Report Error</p>
              <p className="text-red-600 text-sm mt-1">{reportError}</p>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <metric.icon size={24} className={`mx-auto mb-2 ${metric.color}`} />
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Risk Assessment */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Risk Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">DSCR Range:</span>
              <span className={`ml-2 ${minDSCR >= 1.25 ? 'text-green-600' : minDSCR >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {minDSCR.toFixed(2)} - {Math.max(...projections.map(p => p.dscr)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium">Cash Flow Stability:</span>
              <span className={`ml-2 ${avgNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgNetCashFlow >= 0 ? 'Positive' : 'Negative'}
              </span>
            </div>
            <div>
              <span className="font-medium">Overall Risk:</span>
              <span className={`ml-2 ${
                minDSCR >= 1.25 && avgNetCashFlow >= 0 ? 'text-green-600' : 
                minDSCR >= 1.0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {minDSCR >= 1.25 && avgNetCashFlow >= 0 ? 'Low' : 
                 minDSCR >= 1.0 ? 'Moderate' : 'High'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <ResultsCharts results={results} />

      {/* Table */}
      <ResultsTable results={results} />

      {/* Email Report Button (Bottom) */}
      <div className="text-center">
        <button
          onClick={() => setShowEmailForm(true)}
          disabled={reportRequested || reportLoading}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg mx-auto
            transition-all duration-200
            ${reportRequested
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : reportLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {reportLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              Sending Report...
            </>
          ) : (
            <>
              <Download size={24} />
              {reportRequested ? 'Excel Report Sent to Your Email!' : 'Email Me the Excel Report'}
            </>
          )}
        </button>
        {!reportRequested && !reportLoading && (
          <p className="text-gray-600 text-sm mt-2">
            Get a detailed Excel report with amortization schedules and charts
          </p>
        )}
      </div>

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="text-center space-y-2 mb-6">
              <Mail size={48} className="mx-auto text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Get Your Excel Report</h2>
              <p className="text-gray-600">
                Enter your details to receive the detailed analysis report
              </p>
            </div>

            <form onSubmit={handleEmailFormSubmit} className="space-y-4">
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <InputField
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim()}
                  className={`
                    flex-1 py-3 px-6 rounded-lg font-semibold transition-colors
                    ${!name.trim() || !email.trim()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  Send Report
                </button>
              </div>
            </form>

            <div className="text-xs text-gray-500 text-center space-y-1 mt-4">
              <p>• Free analysis with detailed 10-year projections</p>
              <p>• Professional Excel report via email</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}