import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../../services/seller/reports';

const initialState = {
  loading: false,
  chartData: [],
  productList: [],
  error: '',
};

export const fetchRevenueProduct = createAsyncThunk(
  'revenueReport/fetchRevenueProduct',
  (params = {}) => {
    return ReportService.getRevenueProducts({
      ...params,
    }).then((res) => res);
  }
);
export const fetchRevenueProductChart = createAsyncThunk(
  'revenueReport/fetchRevenueProductChart',
  (params = {}) => {
    return ReportService.getRevenueChart({
      ...params,
    }).then((res) => res);
  }
);
const revenueCountSlice = createSlice({
  name: 'eevenueReport',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchRevenueProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRevenueProduct.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.productList = payload.data;
      state.error = '';
    });
    builder.addCase(fetchRevenueProduct.rejected, (state, action) => {
      state.loading = false;
      state.productList = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchRevenueProductChart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRevenueProductChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(fetchRevenueProductChart.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
  },

  reducers: {
    filterOrderProduct(state, action) {
      const { payload } = action;
    },
  },
});
export const { filterOrderProduct } = revenueCountSlice.actions;
export default revenueCountSlice.reducer;
