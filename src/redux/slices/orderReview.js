import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from '../../services/review';

const initialState = {
  loading: false,
  reviews: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    type: 'order',
  },
  meta: {},
};

export const fetchOrderReviews = createAsyncThunk(
  'review/fetchOrderReviews',
  (params = {}) => {
    return reviewService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const orderReviewSlice = createSlice({
  name: 'review',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchOrderReviews.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrderReviews.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.reviews = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchOrderReviews.rejected, (state, action) => {
      state.loading = false;
      state.reviews = [];
      state.error = action.error.message;
    });
  },
});

export default orderReviewSlice.reducer;
