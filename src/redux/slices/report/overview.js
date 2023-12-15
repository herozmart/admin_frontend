import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../../services/reports';

const initialState = {
  loading: false,
  chartData: [],
  productList: [],
  error: '',
};

export const fetchOverviewProduct = createAsyncThunk(
  'overviewReport/fetchOverviewProduct',
  (params = {}) => {
    return ReportService.getOverviewProducts({
      ...params,
    }).then((res) => res);
  }
);
export const fetchOverviewProductChart = createAsyncThunk(
  'overviewReport/fetchOverviewProductChart',
  (params = {}) => {
    return ReportService.getOverviewChart({
      ...params,
    }).then((res) => res);
  }
);
const overviewCountSlice = createSlice({
  name: 'overviewReport',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchOverviewProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOverviewProduct.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.productList = payload.data;
      state.error = '';
    });
    builder.addCase(fetchOverviewProduct.rejected, (state, action) => {
      state.loading = false;
      state.productList = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchOverviewProductChart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOverviewProductChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(fetchOverviewProductChart.rejected, (state, action) => {
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
export const { filterOrderProduct } = overviewCountSlice.actions;
export default overviewCountSlice.reducer;
