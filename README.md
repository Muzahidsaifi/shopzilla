# 🛍️ ShopZilla — Full-Stack E-Commerce Platform

> **Built by Muzahid Saifi** | Frontend Developer (React.js)

A production-ready, full-stack e-commerce platform inspired by Amazon/Flipkart. Features modern 3D UI with glassmorphism design, complete shopping flow, real-time order tracking, and a comprehensive admin dashboard.

---

## ✨ Features

### 🛒 User Side
- **Product browsing** with categories, filters (price, rating, brand), and search with auto-suggestions
- **Product detail pages** with multiple images, variants, specifications, and customer reviews
- **Cart system** with quantity update, remove, price breakdown (tax + shipping)
- **Wishlist** — save products for later
- **Recently viewed products** tracker
- **Coupon/discount codes** validation system
- **Checkout flow** — address selection → payment → review
- **Multiple payment options**: Stripe, Razorpay, Cash on Delivery
- **Order history** with unique Order IDs (e.g. `SZ-L7K2M-A9BX`)
- **Real-time order tracking timeline** (Pending → Confirmed → Shipped → Delivered)
- **Email notifications** for order confirmation and status updates

### 📊 Admin Dashboard
- **Analytics dashboard** — revenue charts, order stats, user counts, growth percentages
- **Products CRUD** — create, edit, delete with image management and specifications
- **Order management** — view all orders, update status with notifications
- **User management** — activate/deactivate, promote to admin
- **Category management** — with emoji icons and slugs
- **Coupon management** — percentage/fixed discounts with expiry and usage limits
- **Low stock alerts**
- **Revenue trend charts** (last 7 days)

### 🎨 UI/UX
- **Dark/Light mode** toggle with system preference detection
- **Glassmorphism + soft shadows + depth** 3D UI
- **Framer Motion animations** — staggered loading, page transitions, micro-interactions
- **Skeleton loaders** while content loads
- **Responsive** — mobile-first design
- **Toast notifications** for all user actions
- **Premium product cards** with hover effects and image swapping

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| State | Redux Toolkit |
| Animations | Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Images | Cloudinary |
| Payment | Stripe + Razorpay |
| Email | Nodemailer |
| Security | Helmet + express-rate-limit |

---

## 📁 Project Structure

```
shopzilla/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer, AdminLayout, Layout
│   │   │   ├── product/        # ProductCard, Skeleton
│   │   │   ├── cart/           # CartDrawer
│   │   │   ├── common/         # ProtectedRoute
│   │   │   └── ui/             # LoadingScreen
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── user/           # Dashboard, Orders, OrderDetail, Wishlist, Profile
│   │   │   └── admin/          # AdminDashboard, AdminProducts, AdminOrders,
│   │   │                       # AdminUsers, AdminCategories, AdminCoupons
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/         # authSlice, cartSlice, wishlistSlice, uiSlice, productSlice
│   │   ├── utils/
│   │   │   ├── api.js          # Axios instance with interceptors
│   │   │   └── helpers.js      # formatPrice, formatDate, ORDER_STATUSES, etc.
│   │   └── styles/
│   │       └── globals.css     # Tailwind + CSS variables + glassmorphism
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                     # Node.js + Express backend
    ├── index.js                # Entry point
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── CategoryCoupon.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   └── adminController.js
    ├── routes/
    │   ├── auth.js
    │   ├── products.js
    │   ├── categories.js
    │   ├── orders.js
    │   ├── cart.js
    │   ├── wishlist.js
    │   ├── coupons.js
    │   ├── users.js
    │   ├── upload.js
    │   ├── payment.js
    │   └── admin.js
    ├── middleware/
    │   └── auth.js             # protect, adminOnly, optionalAuth
    └── utils/
        └── email.js            # Nodemailer helper
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/muzahidsaifi/shopzilla.git
cd shopzilla
npm run install-all
```

### 2. Configure Environment Variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your values

# Client
cp client/.env.example client/.env
# Edit client/.env
```

### 3. Run Development

```bash
# Root level — runs both client and server concurrently
npm run dev

# Or individually:
npm run server    # Backend on http://localhost:5000
npm run client    # Frontend on http://localhost:5173
```

### 4. Seed Admin User

```bash
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.create({ name: 'Admin', email: 'admin@shopzilla.com', password: 'Admin@123456', role: 'admin' });
  console.log('Admin created!');
  process.exit();
});
"
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy /client/dist to Vercel
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render / Railway
```bash
# Set all .env variables in the deployment dashboard
# Start command: node index.js
# Build command: npm install
```

### Database → MongoDB Atlas
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist IPs (0.0.0.0/0 for render/railway)
3. Copy connection string to `MONGODB_URI`

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login and get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/password` | ✅ | Change password |
| POST | `/api/auth/address` | ✅ | Add address |
| PUT | `/api/auth/address/:id` | ✅ | Update address |
| DELETE | `/api/auth/address/:id` | ✅ | Delete address |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List with filters/search/pagination |
| GET | `/api/products/featured` | — | Featured, new arrivals, best sellers |
| GET | `/api/products/search/suggestions?q=` | — | Autocomplete suggestions |
| GET | `/api/products/:slug` | Optional | Product detail + related |
| POST | `/api/products/:id/reviews` | ✅ | Add review |
| POST | `/api/products` | 🔐 Admin | Create product |
| PUT | `/api/products/:id` | 🔐 Admin | Update product |
| DELETE | `/api/products/:id` | 🔐 Admin | Soft delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders/my-orders` | ✅ | User's order history |
| GET | `/api/orders/:id` | ✅ | Order detail |
| PUT | `/api/orders/:id/cancel` | ✅ | Cancel order |
| GET | `/api/orders` | 🔐 Admin | All orders |
| PUT | `/api/orders/:id/status` | 🔐 Admin | Update status |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | 🔐 Admin | Dashboard analytics |
| GET | `/api/admin/users` | 🔐 Admin | All users |
| PATCH | `/api/admin/users/:id` | 🔐 Admin | Update user role/status |
| GET/POST | `/api/admin/coupons` | 🔐 Admin | Coupon management |
| PUT/DELETE | `/api/admin/coupons/:id` | 🔐 Admin | Coupon CRUD |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/categories` | Categories |
| GET/POST | `/api/wishlist` | Wishlist |
| POST | `/api/wishlist/toggle/:id` | Toggle wishlist item |
| POST | `/api/coupons/validate` | Validate coupon |
| POST | `/api/payment/create-intent` | Stripe payment intent |
| POST | `/api/upload` | Upload image to Cloudinary |

---

## 🔐 Security Features
- **Helmet** — Secure HTTP headers
- **express-rate-limit** — 200 req/15min general, 20 req/15min for auth
- **bcryptjs** — Password hashing (12 rounds)
- **JWT** — Stateless authentication
- **Input validation** — Server-side validation
- **Role-based access** — User vs Admin middleware
- **Environment variables** — No secrets in code

---

## 👨‍💻 Developer

**Muzahid Saifi** — Frontend Developer (React.js)

- GitHub: [@muzahidsaifi](https://github.com/muzahidsaifi)
- LinkedIn: [muzahidsaifi](https://linkedin.com/in/muzahidsaifi)
- Portfolio: [muzahidsaifi.dev](https://muzahidsaifi.dev)

---

## 📄 License

MIT License — feel free to use this project for learning or as a base for your own e-commerce platform.



Username: saifimuzahid99
Password: Muzahid@1234
Email:    muzahidsaifi483@gmail.com

pcaL5CAQc8b5qqIv