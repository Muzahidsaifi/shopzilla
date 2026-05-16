import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, CreditCard, Check, ChevronRight, Plus, Tag,
  Wallet, Smartphone, ShieldCheck, Truck, Package, Loader
} from 'lucide-react';
import { selectCartItems, selectCartSubtotal, clearCart, selectCartCoupon, applyCoupon } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Review'];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const coupon = useSelector(selectCartCoupon);
  const { user } = useSelector(s => s.auth);

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(coupon);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const discount = appliedCoupon?.discount || 0;
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax + shipping - discount;

  const [address, setAddress] = useState(
    user?.addresses?.find(a => a.isDefault) || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '', city: '', state: '', pincode: '', country: 'India'
    }
  );

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setAppliedCoupon(res.data.coupon);
      dispatch(applyCoupon(res.data.coupon));
      toast.success(`Coupon applied! You saved ${formatPrice(res.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

const handleRazorpay = async () => {
  setPlacing(true);
  try {
    const { data } = await api.post('/payment/razorpay/create', { amount: total });
    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: 'INR',
      name: 'ShopZilla',
      description: 'Order Payment',
      image: 'https://i.imgur.com/n5tjHFD.png',
      order_id: data.order.id,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: address.phone,
      },
      config: {
        display: {
          blocks: {
            upi_block: {
              name: 'Pay via UPI / QR',
              instruments: [
                { method: 'upi' },
              ],
            },
          },
          sequence: ['block.upi_block'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      theme: { color: '#f97316' },
      handler: async (response) => {
        await placeOrder('razorpay', response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => {
          setPlacing(false);
          toast.error('Payment cancelled');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    toast.error('Payment initialization failed');
    setPlacing(false);
  }
};

  const placeOrder = async (method, transactionId = null) => {
    setPlacing(true);
    try {
      const orderData = {
        items: items.map(i => ({
          product: i._id,
          quantity: i.quantity,
          variant: i.variant,
        })),
        shippingAddress: address,
        payment: {
          method,
          status: method === 'cod' ? 'pending' : 'paid',
          transactionId,
        },
        couponCode: appliedCoupon?.code,
      };
      const res = await api.post('/orders', orderData);
      dispatch(clearCart());
      navigate(`/order-success/${res.data.order._id}`);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed');
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'cod') {
      placeOrder('cod');
} else if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {      handleRazorpay();
    }
  };

  const addressValid = address.fullName && address.phone && address.street && address.city && address.state && address.pincode;

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              i === step ? 'bg-primary-500 text-white shadow-glow' :
              i < step ? 'bg-emerald-500 text-white' :
              'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              {i < step ? <Check size={14}/> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="text-[var(--text-muted)]"/>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Steps Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">

            {/* STEP 0: Address */}
            {step === 0 && (
              <motion.div key="addr" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-500"/> Delivery Address
                </h2>

                {/* Saved Addresses */}
                {user?.addresses?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Saved Addresses:</p>
                    {user.addresses.map((addr, i) => (
                      <button key={i} onClick={() => setAddress(addr)}
                        className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                          address.street === addr.street ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-[var(--border)]'
                        }`}>
                        <p className="font-semibold">{addr.fullName} — {addr.phone}</p>
                        <p className="text-[var(--text-secondary)]">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
                      </button>
                    ))}
                    <p className="text-xs text-[var(--text-muted)] pt-1">Or enter a new address below:</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})}
                    placeholder="Full Name *" className="input-field col-span-2"/>
                  <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})}
                    placeholder="Phone Number *" className="input-field col-span-2"/>
                  <input value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                    placeholder="Street / Area / Flat No. *" className="input-field col-span-2"/>
                  <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                    placeholder="City *" className="input-field"/>
                  <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})}
                    placeholder="State *" className="input-field"/>
                  <input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})}
                    placeholder="Pincode *" className="input-field"/>
                  <input value={address.country} onChange={e => setAddress({...address, country: e.target.value})}
                    placeholder="Country" className="input-field"/>
                </div>
                <button onClick={() => { if(addressValid) setStep(1); else toast.error('Please fill all required fields'); }}
                  className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={16}/>
                </button>
              </motion.div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <motion.div key="pay" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-500"/> Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'cod', icon: <Package size={20}/>, label: 'Cash on Delivery', desc: 'Pay when your order arrives', badge: null },
                    { id: 'razorpay', icon: <Smartphone size={20}/>, label: 'Razorpay', desc: 'UPI, Cards, Net Banking, Wallets', badge: 'Recommended' },

                    { id: 'upi', icon: <Smartphone size={20}/>, label: 'UPI / QR Code', desc: 'PhonePe, GPay, Paytm, BHIM', badge: 'Instant' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === opt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-[var(--border)] hover:border-primary-300'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        paymentMethod === opt.id ? 'bg-primary-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      }`}>{opt.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{opt.label}</span>
                          {opt.badge && <span className="badge badge-success text-[10px]">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        paymentMethod === opt.id ? 'border-primary-500 bg-primary-500' : 'border-[var(--border)]'
                      }`}>
                        {paymentMethod === opt.id && <div className="w-full h-full rounded-full bg-white scale-50"/>}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Security badges */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-6 bg-[var(--bg-secondary)] rounded-xl p-3">
                  <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0"/>
                  <span>100% Secure Payments. Your data is encrypted and safe.</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    Review Order <ChevronRight size={16}/>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <motion.div key="review" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Package size={18} className="text-primary-500"/> Order Review
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item._id} className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
                      <img src={item.images?.[0]?.url || `https://placehold.co/60x60/f97316/white?text=${item.name?.slice(0,2)}`}
                        alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                        <p className="text-primary-500 font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery address summary */}
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl mb-4 text-sm">
                  <p className="font-semibold text-xs text-[var(--text-muted)] mb-1">DELIVERY TO</p>
                  <p className="font-semibold">{address.fullName} — {address.phone}</p>
                  <p className="text-[var(--text-secondary)]">{address.street}, {address.city}, {address.state} {address.pincode}</p>
                </div>

                {/* Payment method summary */}
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl mb-6 text-sm flex items-center gap-2">
                  <Wallet size={16} className="text-primary-500"/>
                  <span className="font-semibold">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {placing ? <><Loader size={16} className="animate-spin"/> Processing...</> : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Order Summary */}
        <div className="space-y-4">
          <div className="glass-card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code" className="input-field text-sm flex-1 py-2"/>
              <button onClick={handleApplyCoupon} disabled={couponLoading}
                className="btn-primary py-2 px-3 text-sm flex items-center gap-1">
                {couponLoading ? <Loader size={14} className="animate-spin"/> : <Tag size={14}/>}
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-emerald-500 text-sm mb-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2">
                <span>✅ {appliedCoupon.code} applied!</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-xs underline">Remove</button>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm border-t border-[var(--border)] pt-4">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-[var(--border)] mt-2">
                <span>Total</span>
                <span className="text-primary-500 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-4 space-y-2">
              {[
                { icon: <Truck size={14}/>, text: 'Free delivery on orders above ₹499' },
                { icon: <ShieldCheck size={14}/>, text: '100% Secure & Encrypted Payment' },
                { icon: <Package size={14}/>, text: 'Easy 7-day return policy' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="text-emerald-500">{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
