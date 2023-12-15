import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/order';
import sellerOrderService from '../../services/seller/order';
import deliverymanOrderService from '../../services/deliveryman/order';

const initialState = {
  loading: false,
  orders: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    status: 'open',
  },
  meta: {},
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchSellerOrders = createAsyncThunk(
  'order/fetchSellerOrders',
  (params = {}) => {
    return sellerOrderService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchDeliverymanOrders = createAsyncThunk(
  'order/fetchDeliverymanOrders',
  (params = {}) => {
    return deliverymanOrderService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.orders = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchSellerOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerOrders.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.orders = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchSellerOrders.rejected, (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchDeliverymanOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDeliverymanOrders.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.orders = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchDeliverymanOrders.rejected, (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.error.message;
    });
  },
});

export default orderSlice.reducer;
