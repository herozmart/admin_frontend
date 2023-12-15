import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../../services/reports';

const initialState = {
  loading: false,
  chartData: [],
  productList: [],
  error: '',
};

export const fetchReportProduct = createAsyncThunk(
  'categoryReport/fetchReportProduct',
  (params = {}) => {
    return ReportService.getCategoriesProducts({
      ...params,
    }).then((res) => res);
  }
);
export const fetchReportProductChart = createAsyncThunk(
  'categoryReport/fetchReportProductChart',
  (params = {}) => {
    return ReportService.getCategoriesChart({
      ...params,
    }).then((res) => res);
  }
);
export const ReportProductCompare = createAsyncThunk(
  'report/ReportProductCompare',
  (params = {}) => {
    return ReportService.productCategoriesCompare({
      ...params,
    }).then((res) => res);
  }
);
const orderCountSlice = createSlice({
  name: 'categoryReport',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchReportProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchReportProduct.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.productList = payload.data;
      state.error = '';
    });
    builder.addCase(fetchReportProduct.rejected, (state, action) => {
      state.loading = false;
      state.productList = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchReportProductChart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchReportProductChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(fetchReportProductChart.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
    builder.addCase(ReportProductCompare.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(ReportProductCompare.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(ReportProductCompare.rejected, (state, action) => {
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
