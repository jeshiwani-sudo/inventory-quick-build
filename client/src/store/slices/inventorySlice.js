import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchEntries = createAsyncThunk(
  'inventory/fetchEntries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, per_page = 10, payment_status } = params;
      let url = `/inventory/?page=${page}&per_page=${per_page}`;
      if (payment_status) url += `&payment_status=${payment_status}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed');
    }
  }
);

export const createEntry = createAsyncThunk(
  'inventory/createEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/', entryData);
      return response.data.entry;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed');
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'inventory/fetchSummary',
  async (store_id, { rejectWithValue }) => {
    try {
      let url = '/inventory/report/summary';
      if (store_id) url += `?store_id=${store_id}`;
      const response = await api.get(url);
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    entries: [],
    summary: null,
    total: 0,
    pages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => { state.loading = true; })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.current_page;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      });
  }
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;