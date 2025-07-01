import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calculateProjections } from '../../utils/calculations';
import { apiService } from '../../services/api';

// Async thunk for calculating projections
export const calculateProjectionsAsync = createAsyncThunk(
  'calculator/calculateProjections',
  async (inputData, { rejectWithValue }) => {
    try {
      const results = calculateProjections(
        inputData.businessPrice,
        inputData.fundingSources,
        inputData.sdeForecast,
        inputData.earnout
      );
      return { inputData, results };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for requesting report
export const requestReportAsync = createAsyncThunk(
  'calculator/requestReport',
  async ({ userData, inputs, results }, { rejectWithValue }) => {
    try {
      const response = await apiService.requestReport(userData, inputs, results);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  // Current step in the process
  currentStep: 'inputs', // 'inputs' | 'results'
  
  // Input data
  inputs: null,
  
  // Calculation results
  results: null,
  
  // Loading states
  loading: false,
  reportLoading: false,
  
  // Error states
  error: null,
  reportError: null,
  
  // Report status
  reportRequested: false,
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    // Navigation actions
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    goToNextStep: (state) => {
      const steps = ['inputs', 'results'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },
    goToPreviousStep: (state) => {
      const steps = ['inputs', 'results'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearReportError: (state) => {
      state.reportError = null;
    },
    
    // Reset calculator state
    resetCalculator: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate projections
      .addCase(calculateProjectionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateProjectionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.inputs = action.payload.inputData;
        state.results = action.payload.results;
        state.currentStep = 'results'; // Go directly to results
      })
      .addCase(calculateProjectionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to calculate projections';
      })
      
      // Request report
      .addCase(requestReportAsync.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
      })
      .addCase(requestReportAsync.fulfilled, (state) => {
        state.reportLoading = false;
        state.reportRequested = true;
      })
      .addCase(requestReportAsync.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload || 'Failed to send report';
      });
  },
});

export const {
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  clearError,
  clearReportError,
  resetCalculator,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;