import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orderItems: [],
  orderShops: [],
  data: {
    user: '',
    userUuid: '',
    address: '',
    currency: '',
    payment_type: '',
    deliveries: [],
  },
  total: {
    product_total: 0,
    product_tax: 0,
    order_tax: 0,
    order_total: 0,
    cashback: 0,
  },
  coupons: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrderItem(state, action) {
      const { payload } = action;
      const existingIndex = state.orderItems.findIndex(
        (item) => item.id === payload.id
      );
      if (existingIndex >= 0) {
        state.orderItems[existingIndex] = payload;
      } else {
        state.orderItems.push(payload);
      }
    },
    reduceOrderItem(state, action) {
      const { payload } = action;
      const itemIndex = state.orderItems.findIndex(
        (item) => item.id === payload.id
      );
      if (state.orderItems[itemIndex].quantity > 1) {
        state.orderItems[itemIndex].quantity -= 1;
      } else if (state.orderItems[itemIndex].quantity === 1) {
        const nextOrderItems = state.orderItems.filter(
          (item) => item.id !== payload.id
        );
        state.orderItems = nextOrderItems;
      }
    },
    removeFromOrder(state, action) {
      const { payload } = action;
      const nextOrderItems = state.orderItems.filter(
        (item) => item.id !== payload.id
      );
      state.orderItems = nextOrderItems;
    },
    clearOrder(state) {
      state.orderItems = [];
      state.orderShops = [];
      state.data = initialState.data;
      state.coupons = [];
      state.total = initialState.total;
    },
    setOrderShops(state, action) {
      const { payload } = action;
      state.orderShops = payload;
    },
    setOrderItems(state, action) {
      const { payload } = action;
      state.orderItems = payload;
    },
    setOrderCurrency(state, action) {
      const { payload } = action;
      state.data.currency = payload;
    },
    setOrderData(state, action) {
      const { payload } = action;
      state.data = { ...state.data, ...payload };
    },
    setOrderTotal(state, action) {
      const { payload } = action;
      state.total = payload;
    },
    setCashback(state, action) {
      const { payload } = action;
      state.total.cashback = payload;
    },
    addOrderCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.shop_id === payload.shop_id
      );
      if (itemIndex >= 0) {
        state.coupons[itemIndex].coupon = payload.coupon;
      } else {
        state.coupons.push(payload);
      }
    },
    verifyOrderCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.shop_id === payload.shop_id
      );
      state.coupons[itemIndex].verified = payload.verified;
      state.coupons[itemIndex].price = payload.price;
    },
    clearOrderShops(state) {
      state.orderShops = [];
      state.total = initialState.total;
    },
  },
});

export const {
  addOrderItem,
  removeFromOrder,
  clearOrder,
  reduceOrderItem,
  setOrderShops,
  setOrderItems,
  setOrderCurrency,
  setOrderData,
  clearOrderShops,
  setOrderTotal,
  addOrderCoupon,
  verifyOrderCoupon,
  setCashback,
} = orderSlice.actions;
export default orderSlice.reducer;
