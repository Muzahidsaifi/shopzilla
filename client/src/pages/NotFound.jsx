import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-container py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-display font-bold text-9xl text-gradient mb-4">404</div>
        <h1 className="font-display font-bold text-3xl mb-3">Page Not Found</h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2"><Home size={16}/> Go Home</Link>
          <Link to="/products" className="btn-secondary flex items-center gap-2"><Search size={16}/> Browse Products</Link>
        </div>
      </motion.div>
    </div>
  );
}
