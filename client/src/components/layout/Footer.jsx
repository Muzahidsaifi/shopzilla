import { Link } from 'react-router-dom';
import { ShoppingCart, Github, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <ShoppingCart size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">ShopZilla</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Your premium shopping destination. Discover millions of products at the best prices.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Github size={16}/>, href: 'https://github.com/muzahidsaifi' },
                { icon: <Twitter size={16}/>, href: '#' },
                { icon: <Instagram size={16}/>, href: '#' },
                { icon: <Linkedin size={16}/>, href: 'https://linkedin.com/in/muzahidsaifi' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Products', to: '/products' },
                { label: 'My Account', to: '/account' },
                { label: 'My Orders', to: '/account/orders' },
                { label: 'Wishlist', to: '/account/wishlist' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                    className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                123 Commerce Street, Tech Park, Noida, UP 201301
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Phone size={14} className="text-primary-500 flex-shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Mail size={14} className="text-primary-500 flex-shrink-0" />
                support@shopzilla.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} ShopZilla. All rights reserved.</p>
          <p>
            Crafted with ❤️ by{' '}
            <a href="https://github.com/muzahidsaifi" target="_blank" rel="noreferrer"
              className="text-primary-500 font-semibold hover:underline">
              Muzahid Saifi
            </a>
            {' '}— Frontend Developer (React.js)
          </p>
        </div>
      </div>
    </footer>
  );
}
