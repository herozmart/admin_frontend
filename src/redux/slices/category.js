import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/category';
import RestCategoryService from '../../services/rest/category';

const initialState = {
  loading: false,
  categories: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  (params = {}) => {
    return categoryService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchSellerCategory = createAsyncThunk(
  'category/fetchSellerCategory',
  (params = {}) => {
    return RestCategoryService.getAll({
      ...initialState.params,
      ...params,
    }).then((res) => res);
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.categories = payload.data.map((item) => ({
        active: item.active,
        img: item.img,
        name: item.translation !== null ? item.translation.title : 'no name',
        key: item.uuid + '_' + item.id,
        uuid: item.uuid,
        children: item.children.map((child) => ({
          name:
            child.translation !== null ? child.translation.title : 'no name',
          uuid: child.uuid,
          key: item.uuid + '_' + child.id,
          img: child.img,
          active: child.active,
          children: child.children.map((treChild) => ({
            name:
              treChild.translation !== null
                ? treChild.translation.title
                : 'no name',
            uuid: treChild.uuid,
            key: child.uuid + '_' + treChild.id,
            img: treChild.img,
            active: treChild.active,
            // children: treChild.children.map((fourChild) => ({
            //   name:
            //     fourChild.translation !== null
            //       ? fourChild.translation.title
            //       : 'no name',
            //   uuid: fourChild.uuid,
            //   key: treChild.uuid + '_' + fourChild.id,
            //   img: fourChild.img,
            //   active: fourChild.active,
            // })),
          })),
        })),
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.categories = [];
      state.error = action.error.message;
    });
    //fetch seller categories
    builder.addCase(fetchSellerCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerCategory.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.categories = payload.data.map((item) => ({
        active: item.active,
        img: item.img,
        name: item.translation !== null ? item.translation.title : 'no name',
        key: item.uuid + '_' + item.id,
        uuid: item.uuid,
        children: item.children.map((child) => ({
          name:
            child.translation !== null ? child.translation.title : 'no name',
          uuid: child.uuid,
          key: item.uuid + '_' + child.id,
          img: child.img,
          active: child.active,
          children: child.children.map((treChild) => ({
            name:
              treChild.translation !== null
                ? treChild.translation.title
                : 'no name',
            uuid: treChild.uuid,
            key: child.uuid + '_' + treChild.id,
            img: treChild.img,
            active: treChild.active,
            // children: treChild.children.map((fourChild) => ({
            //   name:
            //     fourChild.translation !== null
            //       ? fourChild.translation.title
            //       : 'no name',
            //   uuid: fourChild.uuid,
            //   key: treChild.uuid + '_' + fourChild.id,
            //   img: fourChild.img,
            //   active: fourChild.active,
            // })),
          })),
        })),
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchSellerCategory.rejected, (state, action) => {
      state.loading = false;
      state.categories = [];
      state.error = action.error.message;
    });
  },
});

export default categorySlice.reducer;
