import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Orders = lazy(() => import('./pages/user/Orders'));
const OrderDetail = lazy(() => import('./pages/user/OrderDetail'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const Profile = lazy(() => import('./pages/user/Profile'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    } else {
      // Mark as initialized even without token
      dispatch({ type: 'auth/fetchMe/rejected' });
    }
  }, []);

  if (token && !initialized) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="search" element={<SearchResults />} />
          
          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected routes */}
          <Route path="checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="order-success/:orderId" element={
            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
          } />
          
          {/* User dashboard */}
          <Route path="account" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="account/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="account/orders/:id" element={
            <ProtectedRoute><OrderDetail /></ProtectedRoute>
          } />
          <Route path="account/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />
          <Route path="account/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
