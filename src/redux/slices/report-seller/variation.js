import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../../services/seller/reports';

const initialState = {
  loading: false,
  chartData: [],
  productList: [],
  error: '',
};

export const fetchVariationProduct = createAsyncThunk(
  'report/fetchVariationProduct',
  (params = {}) => {
    return ReportService.getVariationProducts({
      ...params,
    }).then((res) => res);
  }
);
export const fetchVariationProductChart = createAsyncThunk(
  'report/fetchVariationProductChart',
  (params = {}) => {
    return ReportService.getVariationChart({
      ...params,
    }).then((res) => res);
  }
);
export const VariationProductCompare = createAsyncThunk(
  'report/VariationProductCompare',
  (params = {}) => {
    return ReportService.productVariationCompare({
      ...params,
    }).then((res) => res);
  }
);
const orderCountSlice = createSlice({
  name: 'variationReport',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchVariationProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVariationProduct.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.productList = payload.data;
      state.error = '';
    });
    builder.addCase(fetchVariationProduct.rejected, (state, action) => {
      state.loading = false;
      state.productList = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchVariationProductChart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVariationProductChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(fetchVariationProductChart.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
    builder.addCase(VariationProductCompare.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(VariationProductCompare.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(VariationProductCompare.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
  },

  reducers: {
    filterReportProduct(state, action) {
      const { payload } = action;
    },
  },
});
export const { filterReportProduct } = orderCountSlice.actions;
export default orderCountSlice.reducer;
