import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ProgressBar } from './components/ProgressBar';
import { BusinessInputForm } from './components/BusinessInputForm';
import { EmailForm } from './components/EmailForm';
import { ResultsPage } from './components/ResultsPage';
import { 
  calculateProjectionsAsync, 
  requestReportAsync,
  goToPreviousStep,
  clearError,
  clearReportError
} from './store/slices/calculatorSlice';
import { 
  validateUserAsync,
  clearError as clearUserError
} from './store/slices/userSlice';

function App() {
  const dispatch = useDispatch();
  
  // Calculator state
  const {
    currentStep,
    inputs,
    results,
    loading,
    reportLoading,
    error,
    reportError,
    reportRequested
  } = useSelector(state => state.calculator);
  
  // User state
  const {
    userData,
    loading: userLoading,
    error: userError
  } = useSelector(state => state.user);

  const steps = ['Business Details', 'Results'];

  const handleInputsSubmit = async (inputData) => {
    dispatch(clearError());
    dispatch(calculateProjectionsAsync(inputData));
  };

  const handleEmailSubmit = async (userInfo) => {
    dispatch(clearUserError());
    dispatch(validateUserAsync(userInfo));
  };

  const handleRequestReport = async () => {
    // Create mock user data for report request
    const mockUserData = {
      name: 'Guest User',
      email: 'guest@example.com'
    };
    
    if (!inputs || !results) return;
    
    dispatch(clearReportError());
    dispatch(requestReportAsync({ userData: mockUserData, inputs, results }));
  };

  const handleBack = () => {
    dispatch(goToPreviousStep());
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case 'inputs': return 1;
      case 'results': return 2;
      default: return 1;
    }
  };

  // Clear errors after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (userError) {
      const timer = setTimeout(() => {
        dispatch(clearUserError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userError, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <ProgressBar
          currentStep={getCurrentStepNumber()}
          totalSteps={2}
          steps={steps}
        />

        {currentStep === 'inputs' && (
          <BusinessInputForm 
            onSubmit={handleInputsSubmit}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 'results' && results && inputs && (
          <ResultsPage
            results={results}
            userData={{ name: 'Guest User', email: 'guest@example.com' }}
            inputs={inputs}
            onBack={handleBack}
            onRequestReport={handleRequestReport}
            reportRequested={reportRequested}
            reportLoading={reportLoading}
            reportError={reportError}
          />
        )}
      </div>

      {(loading || userLoading || reportLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-700">
              {loading && 'Calculating projections...'}
              {userLoading && 'Validating user...'}
              {reportLoading && 'Sending report...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;