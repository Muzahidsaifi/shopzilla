import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    loading: false,
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      brand: '',
      sort: 'newest',
    },
    pagination: { page: 1, pages: 1, total: 0 },
    search: '',
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload.products;
      state.pagination = action.payload.pagination;
    },
    setFeatured: (state, action) => { state.featured = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = { category: '', minPrice: '', maxPrice: '', rating: '', brand: '', sort: 'newest' };
    },
    setSearch: (state, action) => { state.search = action.payload; },
    setPage: (state, action) => { state.pagination.page = action.payload; },
  }
});

export const { setProducts, setFeatured, setLoading, setFilter, resetFilters, setSearch, setPage } = productSlice.actions;
export default productSlice.reducer;
