import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { useSelector } from 'react-redux';

export default function Layout() {
  const cartOpen = useSelector(s => s.ui.cartOpen);
  return (
    <div className="min-h-screen flex flex-col bg-primary-custom">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} />
    </div>
  );
}
