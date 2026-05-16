import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (localStorage.getItem('theme')) return localStorage.getItem('theme');
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, action) => { state.cartOpen = action.payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload; },
  }
});

export const { toggleTheme, setTheme, toggleCart, setCartOpen, toggleSearch, toggleMobileMenu, setMobileMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
