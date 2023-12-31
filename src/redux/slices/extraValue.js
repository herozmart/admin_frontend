import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import extraService from '../../services/extra';

const initialState = {
  loading: false,
  extraValues: [],
  error: '',
  meta: '',
};

export const fetchExtraValues = createAsyncThunk(
  'extra/fetchExtraValues',
  (params = {}) => {
    return extraService
      .getAllValues({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const extraValueSlice = createSlice({
  name: 'extraValue',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchExtraValues.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchExtraValues.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.extraValues = payload.data;
      state.error = '';
      state.meta = payload.meta;
    });
    builder.addCase(fetchExtraValues.rejected, (state, action) => {
      state.loading = false;
      state.extraValues = [];
      state.error = action.error.message;
      state.meta = '';
    });
  },
});

export default extraValueSlice.reducer;
