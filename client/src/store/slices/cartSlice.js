import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    coupon: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(i => i._id === item._id && i.variant?.value === item.variant?.value);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + (item.quantity || 1), item.stock || 99);
        toast.success('Cart updated!');
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
        toast.success('Added to cart!', { icon: '🛒' });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => !(i._id === action.payload._id && i.variant?.value === action.payload.variant?.value));
      saveCart(state.items);
      toast.success('Removed from cart');
    },
    updateQuantity: (state, action) => {
      const { _id, variant, quantity } = action.payload;
      const item = state.items.find(i => i._id === _id && i.variant?.value === variant?.value);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => !(i._id === _id && i.variant?.value === variant?.value));
        } else {
          item.quantity = quantity;
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem('cart');
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      toast.success(`Coupon applied! You saved ₹${action.payload.discount}`);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      toast.success('Coupon removed');
    },
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
export const selectCartCoupon = (state) => state.cart.coupon;

export default cartSlice.reducer;
