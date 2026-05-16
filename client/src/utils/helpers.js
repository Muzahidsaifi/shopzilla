// Format currency in INR
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

// Truncate text
export const truncate = (str, n = 50) => str?.length > n ? str.slice(0, n) + '...' : str;

// Order status config
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'warning', step: 0 },
  confirmed: { label: 'Confirmed', color: 'info', step: 1 },
  processing: { label: 'Processing', color: 'info', step: 2 },
  shipped: { label: 'Shipped', color: 'info', step: 3 },
  out_for_delivery: { label: 'Out for Delivery', color: 'primary', step: 4 },
  delivered: { label: 'Delivered', color: 'success', step: 5 },
  cancelled: { label: 'Cancelled', color: 'danger', step: -1 },
  returned: { label: 'Returned', color: 'danger', step: -1 },
};

// Star rating array
export const getRatingArray = (rating) => {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
};

// Calculate discount percentage
export const getDiscountPercent = (original, current) => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Generate order ID display
export const formatOrderId = (id) => id?.toUpperCase() || '';

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
