# 🚀 ShopZilla — Quick Setup Guide
## Developer: Muzahid Saifi

---

## STEP 1 — Install Dependencies
```bash
cd shopzilla
npm run install-all
# OR manually:
cd server && npm install
cd ../client && npm install
```

---

## STEP 2 — Create .env File
Copy `server/.env.example` to `server/.env` and fill in values:
```bash
cp server/.env.example server/.env
```

Minimum required:
```
MONGODB_URI=mongodb://127.0.0.1:27017/shopzilla
JWT_SECRET=any_long_random_string_here
CLIENT_URL=http://localhost:5173
```

---

## STEP 3 — Seed Database
```bash
cd server
node utils/seed.js
```
Creates: Admin + Demo user + 8 categories + 19 products + 4 coupons

---

## STEP 4 — Run Project
```bash
# From root folder (runs both servers):
npm run dev

# OR separately:
cd server && npm run dev    # Backend: http://localhost:5000
cd client && npm run dev   # Frontend: http://localhost:5173
```

---

## STEP 5 — Login
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@shopzilla.com | Admin@123456 |
| User  | demo@shopzilla.com  | Demo@123 |

Admin Panel: http://localhost:5173/admin

---

## Payment Setup (Razorpay)
1. Signup at razorpay.com
2. Settings → API Keys → Generate Test Keys
3. Add to server/.env:
```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```
4. Add to client/.env:
```
VITE_RAZORPAY_KEY=rzp_test_xxx
```

---

## Email OTP Setup (Gmail)
1. Google Account → Security → 2-Step Verification ON
2. App Passwords → Create → Copy 16-digit password
3. Add to server/.env:
```
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

---

## Coupon Codes (Ready to use)
| Code | Discount |
|------|----------|
| WELCOME10 | 10% off |
| SHOPZILLA20 | 20% off (min ₹999) |
| FLAT200 | ₹200 off (min ₹1499) |
| FREESHIP | Free shipping |

