import React, { useState } from 'react';
import { Mail, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { InputField } from './InputField';

export function EmailForm({ onSubmit, loading = false, error, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSubmit({ name: name.trim(), email: email.trim() });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="text-center space-y-2">
          <Mail size={48} className="mx-auto text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Get Your Results</h2>
          <p className="text-gray-600">
            Enter your details to view the loan analysis and receive your Excel report
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Unable to proceed</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className={`
              w-full py-3 px-6 rounded-lg text-white font-semibold
              transition-all duration-200 flex items-center justify-center gap-2
              ${loading || !name.trim() || !email.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              'View Results'
            )}
          </button>
        </form>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Free analysis with detailed 10-year projections</p>
          <p>• Up to 5 free reports per email address</p>
          <p>• Professional Excel report via email</p>
        </div>
      </div>
    </div>
  );
}