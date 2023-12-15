import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transaction';

const initialState = {
  loading: false,
  transactions: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    status: null,
  },
  meta: {},
};

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  (params = {}) => {
    return transactionService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const transactionSlice = createSlice({
  name: 'shop',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.transactions = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading = false;
      state.transactions = [];
      state.error = action.error.message;
    });
  },
});

export default transactionSlice.reducer;
