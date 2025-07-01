import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for validating user
export const validateUserAsync = createAsyncThunk(
  'user/validateUser',
  async (userInfo, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiService.validateUser(userInfo);
      if (!response.success || !response.canGenerate) {
        throw new Error(response.message || "You've reached your 5 free reports. Contact us to request more.");
      }
      
      // If validation successful, move to results step
      dispatch({ type: 'calculator/setCurrentStep', payload: 'results' });
      
      return { userInfo, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for checking usage
export const checkUsageAsync = createAsyncThunk(
  'user/checkUsage',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.checkUsage(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  // User data
  userData: null,
  
  // Usage information
  usageCount: 0,
  canGenerate: true,
  
  // Loading states
  loading: false,
  usageLoading: false,
  
  // Error states
  error: null,
  usageError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear user data
    clearUserData: (state) => {
      state.userData = null;
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearUsageError: (state) => {
      state.usageError = null;
    },
    
    // Reset user state
    resetUser: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate user
      .addCase(validateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.userInfo;
        state.usageCount = action.payload.response.usageCount || 0;
        state.canGenerate = action.payload.response.canGenerate;
      })
      .addCase(validateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check usage
      .addCase(checkUsageAsync.pending, (state) => {
        state.usageLoading = true;
        state.usageError = null;
      })
      .addCase(checkUsageAsync.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.usageCount = action.payload.usageCount || 0;
        state.canGenerate = action.payload.canGenerate;
      })
      .addCase(checkUsageAsync.rejected, (state, action) => {
        state.usageLoading = false;
        state.usageError = action.payload;
      });
  },
});

export const {
  clearUserData,
  clearError,
  clearUsageError,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;