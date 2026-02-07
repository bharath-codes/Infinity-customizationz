import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { storyCategories, showcaseData, products, categoryDetails, phoneModelOptions } from './data';
import { ShoppingCart, Menu, X, Search, User, Heart, ChevronRight, Phone, Mail, Instagram, Truck, ShieldCheck, Gift, Star, ArrowRight, MessageCircle, Filter, CheckCircle, AlertCircle, Info, ChevronDown, Trash2, ArrowLeft, LogOut, Share2, Copy, Check, Clock } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { API_BASE_URL } from './services/api';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import UserOrders from './pages/UserOrders';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminPhoneModels from './pages/AdminPhoneModels';
import Checkout from './pages/Checkout';
import SearchResults from './pages/SearchResults';

import BackButton from './components/BackButton';
import ProductVariantSelector from './components/ProductVariantSelector';

// --- 1. GLOBAL CONTEXT & UTILITIES ---
const LoaderContext = createContext();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// --- 2. THE INFINITY LOADER (∞) ---
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
    <div className="infinity-loader"></div>
    <p className="mt-6 text-brand-blue font-serif font-bold tracking-[0.3em] text-xs uppercase animate-pulse">
      Infinity<span className="text-brand-gold"> Customizations</span>
    </p>
    <style>{`
      .infinity-loader { width: 60px; height: 30px; position: relative; }
      .infinity-loader:before, .infinity-loader:after {
        content: ""; position: absolute; top: 0; width: 30px; height: 30px;
        border: 4px solid #003366; box-sizing: border-box; border-radius: 50%;
        transform-origin: 100% 50%; animation: infi-l 2s infinite linear;
      }
      .infinity-loader:after {
        left: auto; right: 0; border: 4px solid #D4AF37;
        transform-origin: 0% 50%; animation: infi-r 2s infinite linear;
      }
      @keyframes infi-l { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes infi-r { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    `}</style>
  </div>
);

// SmartLink: Navigation that triggers the Infinity Loader
const SmartLink = ({ to, children, className, onClick }) => {
  const navigate = useNavigate();
  const { setLoading } = useContext(LoaderContext);
  const location = useLocation();
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    if (location.pathname === to) return;
    setLoading(true);
    setTimeout(() => { navigate(to); setLoading(false); }, 800);
  };
  return <a href={to} onClick={handleClick} className={`cursor-pointer ${className}`}>{children}</a>;
};

// --- 3. UI COMPONENTS ---

const WhatsAppIcon = ({ size = 22, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/></svg>
);

const AnnouncementBar = () => (
  <div className="bg-brand-secondary text-white text-[10px] md:text-xs py-3 px-4 overflow-hidden relative z-50 border-b border-brand-secondary/30">
    <div className="animate-marquee font-semibold tracking-wide uppercase flex gap-12 text-white/90">
      <span>Free shipping on orders above ₹500</span> <span>•</span> <span>New: Custom ID Cards & NFC Tags</span>
    </div>
  </div>
);

const Navbar = ({ cartCount }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white text-brand-dark sticky top-0 z-50 shadow-md border-b border-border-light transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-brand-primary hover:text-brand-secondary transition-colors p-2" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          <SmartLink to="/" className="flex-shrink-0">
             <div className="h-10 w-28 md:h-12 md:w-36 overflow-hidden relative">
               <img src="/images/logo.png" alt="Infinity" className="w-full h-full object-cover object-center scale-110" />
             </div>
          </SmartLink>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-auto bg-surface-elevated border border-border-light rounded-xl px-4 py-3 items-center text-brand-dark/60 focus-within:bg-white focus-within:border-brand-secondary focus-within:shadow-md transition-all duration-200">
          <Search size={18} className="text-brand-dark/40" />
          <input id="global-search-input" type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-brand-dark placeholder:text-brand-dark/40" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); }} />
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-brand-primary">
          <a href="https://wa.me/918985993948" target="_blank" rel="noreferrer" className="text-brand-primary hover:text-green-600 transition-colors hover:scale-110 duration-200 p-2" title="WhatsApp"><WhatsAppIcon size={22} /></a>
          <button className="md:hidden text-brand-primary hover:text-brand-secondary transition-colors p-2" onClick={() => setShowMobileSearch(true)}><Search size={22} /></button>
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors p-2 rounded-lg hover:bg-surface-elevated duration-200">
                <User size={24} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border-light rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 overflow-hidden z-50">
                <Link to="/profile" className="block px-4 py-3 text-sm text-brand-dark hover:bg-surface-elevated transition-colors border-b border-border-light font-medium">My Profile</Link>
                <Link to="/orders" className="block px-4 py-3 text-sm text-brand-dark hover:bg-surface-elevated transition-colors border-b border-border-light font-medium">My Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2 font-medium transition-colors">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <SmartLink to="/login" className="flex items-center gap-2 text-brand-secondary hover:text-brand-secondary/80 transition-colors p-2 rounded-lg hover:bg-surface-elevated duration-200">
              <User size={24} />
            </SmartLink>
          )}
          <SmartLink to="/cart" className="relative text-brand-primary hover:text-brand-secondary transition-colors hover:scale-110 duration-200 p-2">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">{cartCount}</span>}
          </SmartLink>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border-light p-4 space-y-2 absolute w-full left-0 shadow-lg z-50 animate-slideDown">
          <SmartLink to="/" className="block font-semibold text-brand-secondary py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>Home</SmartLink>
          <SmartLink to="/shop/frames" className="block text-brand-primary py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>Photo Frames</SmartLink>
          <SmartLink to="/shop/apparel" className="block text-brand-primary py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>Apparel</SmartLink>
          {isAuthenticated ? (
            <>
              <SmartLink to="/profile" className="block text-brand-primary py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>My Profile</SmartLink>
              <SmartLink to="/orders" className="block text-brand-primary py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>My Orders</SmartLink>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium mt-2 transition-colors">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <SmartLink to="/login" className="block text-brand-secondary font-semibold py-2 px-4 rounded-lg hover:bg-surface-elevated transition-colors" onClick={() => setIsOpen(false)}>Login</SmartLink>
          )}
        </div>
      )}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 pt-20">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideInUp">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Search Products</h2>
            <input autoFocus type="text" placeholder="Search for products, categories..." id="mobile-search-input" className="w-full px-4 py-3 border-2 border-border-light rounded-xl focus:outline-none focus:border-brand-secondary focus:shadow-md transition-all duration-200" onKeyDown={(e) => {
              const v = e.target.value;
              if (e.key === 'Enter' && v && v.trim()) { setShowMobileSearch(false); navigate(`/search?q=${encodeURIComponent(v.trim())}`); }
            }} />
            <button onClick={() => setShowMobileSearch(false)} className="w-full mt-4 px-4 py-3 text-sm font-semibold text-brand-primary border-2 border-border-light rounded-lg hover:bg-surface-elevated transition-colors duration-200">Close</button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const [expandedSection, setExpandedSection] = React.useState(null);

  const footerSections = [
    {
      id: 'about',
      title: 'About Us',
      content: 'Welcome to Infinity Customizations. We are a small business dedicated to creating customized products tailored to our customers\' preferences. Every product is made with attention to detail and personalized according to the design, text, or specifications provided by the customer. All our products are prepared only after an order is confirmed to ensure uniqueness and quality. We aim to deliver creative, reliable, and satisfactory customized solutions for gifts, personal use, and special occasions.'
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: 'Business Name: Infinity Customizations\nEmail: infinitycustomizations@gmail.com\nPhone: +91 89859 93948\nWorking Hours: Monday – Saturday | 10:00 AM – 6:00 PM\n\nFor order-related queries, customization details, or support, feel free to contact us.'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: 'At Infinity Customizations, your privacy is important to us. We collect personal information such as name, phone number, email address, and delivery address solely for order processing, communication, and delivery purposes. All payments made on our website are securely processed through trusted third-party payment gateways. We do not store or have access to your card, UPI, or banking details. Customer information is never sold, rented, or shared with third parties except when required to complete an order or comply with legal requirements. By using our website, you consent to this privacy policy.'
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      content: 'By accessing this website and placing an order with Infinity Customizations, you agree to the following terms:\n• All products are customized based on customer inputs.\n• Orders cannot be modified or cancelled once confirmed.\n• Slight variations in color or appearance may occur due to screen or material differences.\n• Delivery timelines are estimated and may vary due to courier or external factors.\n• We reserve the right to cancel or refuse orders that violate legal or ethical standards.\n\nThese terms may be updated at any time without prior notice.'
    },
    {
      id: 'refund',
      title: 'Refund & Cancellation Policy',
      content: 'As all products sold by Infinity Customizations are custom-made and personalized, we do not offer cancellations or refunds once an order is placed. Refunds or replacements will be provided only if:\n• The product is damaged during delivery, or\n• There is a manufacturing defect, or\n• An incorrect product is delivered\n\nCustomers must report the issue within 48 hours of receiving the product, along with clear photos or videos. If approved, refunds will be processed within 5–7 business days to the original payment method.'
    },
    {
      id: 'shipping',
      title: 'Shipping Policy',
      content: 'Orders are processed within 2-3 business days after confirmation. Shipping time depends on the customer\'s location and courier service. Infinity Customizations is not responsible for delays caused by courier partners or unforeseen circumstances.'
    }
  ];

  return (
    <footer className="bg-brand-blue text-white pt-16 pb-8 border-t border-brand-accent/10 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section: Branding + Contact + Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Social */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">
              Infinity <span className="text-brand-accent text-xs ml-1 font-sans font-semibold tracking-wider">CUSTOMIZATIONS</span>
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
              Premium custom printing and digital services delivered across India with exceptional quality and attention to detail.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/infinitycustomizations" target="_blank" rel="noreferrer" title="Instagram" className="text-gray-300 hover:text-brand-accent transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/share/1FzoghaLcu/?mibextid=wwXIfr" target="_blank" rel="noreferrer" title="Facebook" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.072C22 6.477 17.523 2 11.928 2S2 6.477 2 12.072C2 17.09 5.657 21.128 10.438 21.924v-6.93H7.898v-2.922h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.77-1.63 1.56v1.874h2.773l-.443 2.922h-2.33v6.93C18.343 21.128 22 17.09 22 12.072z"/></svg>
              </a>
              <a href="https://wa.me/918985993948" target="_blank" rel="noreferrer" title="WhatsApp" className="text-gray-300 hover:text-green-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                <WhatsAppIcon size={20} />
              </a>
              <a href="mailto:infinitycustomizations@gmail.com" title="Email" className="text-gray-300 hover:text-brand-accent transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-6">📞 Get in Touch</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <p className="flex items-start gap-3 hover:text-white transition-colors">
                <Phone size={18} className="flex-shrink-0 mt-0.5" />
                <span>+91 89859 93948</span>
              </p>
              <p className="flex items-start gap-3 hover:text-white transition-colors">
                <Mail size={18} className="flex-shrink-0 mt-0.5" />
                <span>infinitycustomizations@gmail.com</span>
              </p>
              <p className="flex items-start gap-3 hover:text-white transition-colors">
                <Clock size={18} className="flex-shrink-0 mt-0.5" />
                <span>Mon - Sat: 10:00 AM - 6:00 PM</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-6">⚡ Quick Links</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <Link to="/" className="block hover:text-brand-accent transition-colors duration-200">→ Home</Link>
              <a href="https://wa.me/918985993948" target="_blank" rel="noreferrer" className="block hover:text-brand-accent transition-colors duration-200">→ Contact Support</a>
              <a href="mailto:infinitycustomizations@gmail.com" className="block hover:text-brand-accent transition-colors duration-200">→ Email Us</a>
              <Link to="/login" className="block hover:text-brand-accent transition-colors duration-200">→ Track Order</Link>
            </div>
          </div>
        </div>

        {/* Expandable Policies Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-brand-accent mb-4">📋 Policies & Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {footerSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-brand-accent text-sm">{section.title}</h4>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSection === section.id ? 'rotate-180' : ''}`} />
                </div>
                {expandedSection === section.id && (
                  <p className="text-xs text-gray-300 mt-3 leading-relaxed whitespace-pre-line">{section.content}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-2">© 2026 Infinity Customizations. All Rights Reserved.</p>
          <p className="text-xs text-gray-500">Crafting memories, one customization at a time.</p>
        </div>
      </div>
    </footer>
  );
};

// --- 4. HOME PAGE COMPONENTS ---

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([
    { id: 1, image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=60&w=1200", title: "Flat 20% Off", link: "/shop/frames" },
    { id: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=60&w=1200", title: "New Arrival: Tees", link: "/shop/apparel" },
    { id: 3, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=60&w=1200", title: "Luxury Hampers", link: "/shop/bouquets" }
  ]);

  useEffect(() => {
    const fetchShowcaseImages = async () => {
      const tryFetch = async (cat) => {
        try {
          const res = await fetch(`${API_BASE_URL}/categories/${cat}/showcase-images`);
          if (!res.ok) return null;
          const data = await res.json();
          if (data.images && data.images.filter(img => img).length > 0) return data;
        } catch (err) {
          return null;
        }
        return null;
      };

      const data = await tryFetch('hero') || await tryFetch('frames');
      if (data) {
        const showcaseSlides = data.images
          .filter(img => img)
          .map((img, idx) => ({ id: idx + 1, image: img, title: data.categoryTitle || 'Featured Items', link: `/shop/${data.categoryId || 'frames'}` }));
        if (showcaseSlides.length > 0) setSlides(showcaseSlides);
      }
    };
    fetchShowcaseImages();
  }, []);

  useEffect(() => { 
    const t = setInterval(() => setCurrent(s => (s === slides.length-1 ? 0 : s+1)), 2000); 
    return () => clearInterval(t); 
  }, [slides.length]);

  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg relative h-[200px] md:h-[350px] group border border-white/20">
      <div className="flex transition-transform duration-700 h-full" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map(s => (
          <div key={s.id} className="min-w-full h-full relative">
            <picture>
              <source type="image/webp" srcSet={`${encodeURI(s.image)}?q=60&w=400 400w, ${encodeURI(s.image)}?q=60&w=800 800w, ${encodeURI(s.image)}?q=60&w=1200 1200w`} />
              <img loading="lazy" decoding="async" src={encodeURI(s.image)} srcSet={`${encodeURI(s.image)}?q=60&w=400 400w, ${encodeURI(s.image)}?q=60&w=800 800w, ${encodeURI(s.image)}?q=60&w=1200 1200w`} sizes="100vw" className="w-full h-full object-cover" alt="" />
            </picture>
            <div className="absolute inset-0 bg-black/30 flex items-center px-10"><h2 className="text-3xl md:text-5xl font-serif font-bold text-white">{s.title}</h2></div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">{slides.map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all ${current === i ? 'w-6 bg-brand-gold' : 'w-2 bg-white/50'}`}></div>))}</div>
    </div>
  );
};

const StoryCircles = () => (
  <div className="bg-white pt-4 pb-2">
    <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide snap-x">
      {storyCategories.map((cat, index) => (
        <SmartLink to={`/shop/${cat.id}`} key={index} className="flex flex-col items-center flex-shrink-0 snap-start w-[72px] md:w-24 group">
          <div className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-full p-[2px] bg-gradient-to-tr from-brand-blue via-blue-400 to-brand-gold group-hover:scale-105 transition duration-300">
            <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden bg-gray-100">
              <img loading="lazy" src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-800 mt-1.5 text-center truncate w-full">{cat.name}</span>
        </SmartLink>
      ))}
    </div>
  </div>
);

const ShowcaseCard = ({ product, activeIdx, hidePriceOnHome }) => {
  if (!product) return null;
  const productId = product._id || product.id;
  const images = product.images || [product.image];
  return (
    <SmartLink to={`/product/${productId}`} className="block group w-full">
      <div className="relative w-full aspect-[4/5] md:h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
        {product.isBestSeller && (
          <div className="absolute top-4 right-4 bg-brand-secondary text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-10">
            Best Seller
          </div>
        )}
        <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${(activeIdx % images.length) * 100}%)` }}>
          {images.map((img, i) => (
            <div key={i} className="min-w-full h-full relative">
              <picture>
                <source type="image/webp" srcSet={`${encodeURI(img)}?q=60&w=400 400w, ${encodeURI(img)}?q=60&w=800 800w, ${encodeURI(img)}?q=60&w=1200 1200w`} />
                <img loading="lazy" decoding="async" src={encodeURI(img)} srcSet={`${encodeURI(img)}?q=60&w=400 400w, ${encodeURI(img)}?q=60&w=800 800w, ${encodeURI(img)}?q=60&w=1200 1200w`} sizes="100vw" className="w-full h-full object-cover" alt="" />
              </picture>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-brand-blue/90 p-3 pt-10">
          <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
          {!hidePriceOnHome && <p className="text-brand-gold font-bold text-xs">₹{product.price}</p>}
        </div>
      </div>
    </SmartLink>
  );
};

const CuratedCategorySection = ({ categoryId, categoryTitle, hidePriceOnHome }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        const data = await res.json();
        if (data.showcaseProducts && data.showcaseProducts.length > 0) {
          try {
            const productPromises = data.showcaseProducts.map(productId =>
              fetch(`${API_BASE_URL}/products/${productId}`)
                .then(r => r.ok ? r.json() : null)
            );
            const prods = await Promise.all(productPromises);
            const validProds = prods.filter(p => p !== null);
            setShowcaseProducts(validProds.length > 0 ? validProds : []);
          } catch (fetchErr) {
            setShowcaseProducts([]);
          }
        } else {
          setShowcaseProducts([]);
        }
      } catch (err) {
        setShowcaseProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcaseProducts();
  }, [categoryId]);

  useEffect(() => { 
    const t = setInterval(() => setActiveIdx(p => (p + 1) % 3), 2000); 
    return () => clearInterval(t); 
  }, []);

  if (loading) return null;
  if (showcaseProducts.length === 0) return null;

  return (
    <section className="bg-white py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-2xl font-serif font-bold text-brand-dark">{categoryTitle}</h3>
          <SmartLink to={`/shop/${categoryId}`} className="text-brand-blue font-bold text-xs">View All <ArrowRight size={14} className="inline"/></SmartLink>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-8">
          {showcaseProducts.map(p => <ShowcaseCard key={p._id} product={p} activeIdx={activeIdx} hidePriceOnHome={hidePriceOnHome} />)}
        </div>
      </div>
    </section>
  );
};

const BestSellers = ({ hidePriceOnHome }) => {
  const [best, setBest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBest = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/best-sellers`);
        if (res.ok) {
          const cat = await res.json();
          if (cat && cat.showcaseProducts && cat.showcaseProducts.length > 0) {
            const proms = cat.showcaseProducts.map(id => fetch(`${API_BASE_URL}/products/${id}`).then(r => r.ok ? r.json() : null));
            const results = (await Promise.all(proms)).filter(Boolean);
            if (results.length > 0) setBest(results);
            else setBest(null);
          } else {
            setBest(null);
          }
        } else {
          setBest(null);
        }
      } catch (err) {
        setBest(null);
      } finally {
        setLoading(false);
      }
    };
    loadBest();
  }, []);

  const list = best || products.slice(0, 5);

  return (
    <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide snap-x">
      {list.map((p) => {
        const productId = p._id || p.id;
        return (
          <SmartLink to={`/product/${productId}`} key={productId} className="min-w-[140px] md:min-w-[200px] snap-start bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 relative">
            {p.isBestSeller && (
              <div className="absolute top-2 right-2 bg-brand-secondary text-white px-2 py-1 rounded-full text-xs font-bold uppercase z-10">
                Best Seller
              </div>
            )}
            <div className="h-40 md:h-60 overflow-hidden relative bg-gray-50">
              <picture>
                <source type="image/webp" srcSet={`${encodeURI(p.image)}?q=60&w=400 400w, ${encodeURI(p.image)}?q=60&w=800 800w`} />
                <img loading="lazy" decoding="async" src={encodeURI(p.image)} srcSet={`${encodeURI(p.image)}?q=60&w=400 400w, ${encodeURI(p.image)}?q=60&w=800 800w`} sizes="(max-width: 768px) 50vw, 20vw" alt={p.name} className="w-full h-full object-cover" />
              </picture>
            </div>
            <div className="p-2 md:p-3">
              <h4 className="font-bold text-gray-900 text-xs md:text-sm truncate">{p.name}</h4>
              {!hidePriceOnHome && <span className="text-sm font-bold text-brand-blue">₹{p.price}</span>}
            </div>
          </SmartLink>
        );
      })}
    </div>
  );
};

const Home = () => {
  const showcaseCategories = [
    { categoryId: "frames", categoryTitle: "Photo Frames" },
    { categoryId: "magazines", categoryTitle: "Magazines & Books" },
    { categoryId: "memories", categoryTitle: "Polaroids & Memories" },
    { categoryId: "flowers", categoryTitle: "Flowers & Bouquets" },
    { categoryId: "hampers", categoryTitle: "Hampers & Combos" },
    { categoryId: "apparel", categoryTitle: "T-Shirts & Apparel" },
    { categoryId: "essentials", categoryTitle: "Phone Cases & Essentials" },
    { categoryId: "addons", categoryTitle: "Calendars & Magnets" },
    { categoryId: "vintage", categoryTitle: "Vintage Collection" },
    { categoryId: "smart-digital", categoryTitle: "Smart & Digital Services" },
  ];

  const location = useLocation();
  const hidePriceOnHome = location.pathname === '/';

  return (
    <div className="bg-brand-light min-h-screen">
      <AnnouncementBar />
      <StoryCircles />
      <HeroCarousel />
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="px-4 mb-3"><h3 className="text-lg md:text-2xl font-bold text-brand-dark font-serif">Best Sellers</h3></div>
        <BestSellers hidePriceOnHome={hidePriceOnHome} />
      </section>
      <div className="space-y-2 pb-12">
        {showcaseCategories.map((cat) => (
          <CuratedCategorySection 
            key={cat.categoryId} 
            categoryId={cat.categoryId} 
            categoryTitle={cat.categoryTitle} 
            hidePriceOnHome={hidePriceOnHome}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryPage = () => {
  const { id } = useParams();
  const details = categoryDetails[id] || { title: "Collection", desc: "Browse our products" };
  const [catProducts, setCatProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/category/${id}`);
        const data = await res.json();
        setCatProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        const fallbackProducts = products.filter(p => p.categoryId === id);
        setCatProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-blue text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{details.title}</h1>
        <p className="text-blue-100 text-sm">{details.desc}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {catProducts.length > 0 ? (
          catProducts.map(p => {
            const productId = p._id || p.id;
            return (
              <SmartLink to={`/product/${productId}`} key={productId} className="block group relative">
                {p.isBestSeller && (
                  <div className="absolute top-2 right-2 bg-brand-secondary text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-10">
                    Best Seller
                  </div>
                )}
                <div className="rounded-xl overflow-hidden aspect-[4/5] bg-gray-100">
                  <picture>
                    <source type="image/webp" srcSet={`${encodeURI(p.image)}?q=60&w=400 400w, ${encodeURI(p.image)}?q=60&w=800 800w`} />
                    <img loading="lazy" decoding="async" src={encodeURI(p.image)} srcSet={`${encodeURI(p.image)}?q=60&w=400 400w, ${encodeURI(p.image)}?q=60&w=800 800w`} sizes="(max-width: 768px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
                  </picture>
                </div>
                <h3 className="font-serif font-bold text-brand-dark text-sm mt-3 truncate">{p.name}</h3>
                <p className="text-brand-blue font-bold text-sm">₹{p.price}</p>
              </SmartLink>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">No products found in this category.</p>
        )}
      </div>
    </div>
  );
};

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyLinkClicked, setCopyLinkClicked] = useState(false);
  const [phoneCompany, setPhoneCompany] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  // phoneCompanies expected as an object mapping company -> [models]
  const [phoneCompanies, setPhoneCompanies] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [wrapType, setWrapType] = useState('none');
  const [wrapPrice, setWrapPrice] = useState(0);
  const [hamperItems, setHamperItems] = useState([]);
  const [hamperItemTotal, setHamperItemTotal] = useState(0);
  // T-Shirt configuration states
  const [tshirtMaterial, setTshirtMaterial] = useState('poly-cotton');
  const [tshirtNeck, setTshirtNeck] = useState('round');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [tshirtColor, setTshirtColor] = useState('white'); // For round neck
  const [tshirtBasePrice, setTshirtBasePrice] = useState(499);
  // Signature Day T-Shirt states
  const [signatureDayTShirtColor, setSignatureDayTShirtColor] = useState('colorless');
  const [signatureDayTShirtNeck, setSignatureDayTShirtNeck] = useState('colored');
  const [signatureDaySelectedColor, setSignatureDaySelectedColor] = useState('maroon'); // For colored neck
  const [signatureDayBasePrice, setSignatureDayBasePrice] = useState(179);
  
  // New fabric-based t-shirt variant state
  const [currentVariant, setCurrentVariant] = useState({
    fabric: '',
    color: '',
    size: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });

  // Color options for t-shirts
  const coloredNeckColors = [
    { name: 'maroon', hex: '#800000' },
    { name: 'navy blue', hex: '#001a4d' },
    { name: 'black', hex: '#000000' },
    { name: 'white', hex: '#FFFFFF' }
  ];

  const roundNeckColors = [
    { name: 'white', hex: '#FFFFFF' },
    { name: 'light blue', hex: '#87CEEB' },
    { name: 'pink', hex: '#FFB6C1' },
    { name: 'yellow', hex: '#FFFF00' }
  ];

  const isPhoneCase = product && (product.id === 'case1' || (product.name || '').toLowerCase().includes('phone case'));
  const isHamper = product && (product.categoryId === 'hampers' || (product.name || '').toLowerCase().includes('hamper'));
  const isTShirt = product && (product.categoryId === 'apparel' && ((product.name || '').toLowerCase().includes('t-shirt') || (product.name || '').toLowerCase().includes('tshirt')));
  const isCustomizedTShirt = product && product.id === 't1';
  const isSignatureDayTShirt = product && product.id === 't2';
  
  // New fabric/color/size based t-shirts
  const isFabricBasedTShirt = product && ['collared-tshirt', 'collarless-tshirt'].includes(product._id);
  const isQuantityBasedTShirt = product && product._id === 'signature-tshirt';
  const isNewStyleTShirt = isFabricBasedTShirt || isQuantityBasedTShirt;

  // Calculate T-shirt price based on quantity
  const calculateTShirtPrice = (quantity) => {
    if (quantity <= 4) return 499;
    if (quantity === 5 || quantity <= 9) return 479;
    if (quantity >= 10 && quantity <= 19) return 459;
    if (quantity >= 20) return 419;
    return 499;
  };

  // Calculate Signature Day T-shirt price
  const calculateSignatureDayPrice = (quantity) => {
    if (quantity >= 40 && quantity <= 49) return 179;
    if (quantity >= 50 && quantity <= 59) return 169;
    if (quantity >= 60 && quantity <= 70) return 159;
    if (quantity > 70) return 149;
    return 179; // default for less than 40
  };

  useEffect(() => {
    if (isCustomizedTShirt) {
      let price = calculateTShirtPrice(qty);
      // Round neck is 50 rupees less
      if (tshirtNeck === 'round') {
        price -= 50;
      }
      setTshirtBasePrice(price);
    } else if (isSignatureDayTShirt) {
      let basePrice = calculateSignatureDayPrice(qty);
      // Add 50 for colored print if colored neck type
      if (signatureDayTShirtNeck === 'colored' && signatureDayTShirtColor === 'colored') {
        basePrice += 50;
      }
      // Round neck is 50 rupees less
      if (signatureDayTShirtNeck === 'round') {
        basePrice -= 50;
      }
      setSignatureDayBasePrice(basePrice);
    }
  }, [qty, isCustomizedTShirt, isSignatureDayTShirt, signatureDayTShirtColor, tshirtNeck, signatureDayTShirtNeck]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setMainImage(data.image || data.images?.[0] || "");
          fetchReviews(data._id || data.id);
        } else {
          const localProduct = products.find(item => item.id === id);
          setProduct(localProduct);
          if (localProduct) {
            setMainImage(localProduct.image);
            setReviews(localProduct.reviews || []);
          }
        }
      } catch (err) {
        const localProduct = products.find(item => item.id === id);
        setProduct(localProduct);
        if (localProduct) {
          setMainImage(localProduct.image);
          setReviews(localProduct.reviews || []);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchPhoneModels = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/phone-models`);
        if (res.ok) {
          const data = await res.json();
          // backend returns an object { Company: [models] } but guard against other shapes
          if (!data) return setPhoneCompanies({});
          if (Array.isArray(data)) {
            // convert array of {company, models} to object
            const obj = {};
            data.forEach(d => { if (d && d.company) obj[d.company] = d.models || []; });
            setPhoneCompanies(obj);
          } else if (typeof data === 'object') {
            setPhoneCompanies(data);
          } else {
            setPhoneCompanies({});
          }
        }
      } catch (err) {
        console.log('Could not load phone models:', err);
      }
    };

    const fetchReviews = async (productId) => {
      try {
        setReviewsLoading(true);
        const r = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
        if (!r.ok) throw new Error('Failed');
        const d = await r.json();
        setReviews(Array.isArray(d) ? d : []);
      } catch (err) {
        console.log('Could not load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchPhoneModels();
  }, [id]);

  useEffect(() => { 
    if (product) { 
      setSelectedVariant(product.variants ? product.variants[0] : null); 
      setMainImage(product.image || product.images?.[0] || "");
    } 
  }, [product]);

  // Add-on wrap price calculation
  const computeWrapPrice = (price, type) => {
    if (!type || type === 'none') return 0;
    const p = Number(price || 0);
    if (type === 'normal') {
      // Normal wrap: ₹39 for products below ₹300, ₹69 for ₹300 and above
      return p < 300 ? 39 : 69;
    }
    if (type === 'premium') {
      // Premium wrap: ₹79 for products below ₹300, ₹99 for ₹300 and above
      return p < 300 ? 79 : 99;
    }
    return 0;
  };

  useEffect(() => {
    setWrapPrice(computeWrapPrice(product?.price, wrapType));
  }, [product, wrapType]);

  const handleAddToCart = () => {
    // Validate MOQ for new t-shirts
    if (isNewStyleTShirt && product.minimumOrderQuantity > 1) {
      if (currentVariant.quantity < product.minimumOrderQuantity) {
        alert(`Minimum order quantity is ${product.minimumOrderQuantity} pieces. Please select at least that many.`);
        return;
      }
    }
    
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        alert('Please select phone company and model');
        return;
      }
    }
    
    let customizationDetails = '';
    let itemPrice = Number(product.price || 0);
    let itemQuantity = qty;
    
    if (isNewStyleTShirt) {
      // Handle new fabric-based and quantity-based t-shirts
      customizationDetails = `${product.subcategoryName} T-Shirt: Fabric: ${currentVariant.fabric}, Color: ${currentVariant.color}, Size: ${currentVariant.size}, Qty: ${currentVariant.quantity} pcs`;
      itemPrice = currentVariant.unitPrice;
      itemQuantity = currentVariant.quantity;
    } else if (isCustomizedTShirt) {
      const selectedColor = tshirtNeck === 'round' ? tshirtColor : 'N/A';
      customizationDetails = `Material: ${tshirtMaterial}, Neck: ${tshirtNeck}, Color: ${selectedColor}, Size: ${tshirtSize}, Qty: ${qty} pcs`;
      itemPrice = tshirtBasePrice;
    } else if (isSignatureDayTShirt) {
      customizationDetails = `Signature Day T-Shirt, Neck: ${signatureDayTShirtNeck}, Color: ${signatureDaySelectedColor}, Qty: ${qty} pcs`;
      itemPrice = signatureDayBasePrice;
    } else if (isPhoneCase) {
      customizationDetails = `Phone: ${phoneCompany} / ${phoneModel}`;
    } else if (isHamper) {
      customizationDetails = JSON.stringify(hamperItems);
    } else {
      customizationDetails = product.customizationDetails || '';
    }
    
    const item = { ...product, id: product._id || product.id, price: itemPrice, quantity: itemQuantity, customizationDetails, addOn: { type: wrapType, price: wrapPrice }, hamperItems, hamperItemTotal };
    addToCartContext(item);
    alert('Added to cart');
  };


  const handleBuyNow = () => {
    // Validate MOQ for new t-shirts
    if (isNewStyleTShirt && product.minimumOrderQuantity > 1) {
      if (currentVariant.quantity < product.minimumOrderQuantity) {
        alert(`Minimum order quantity is ${product.minimumOrderQuantity} pieces. Please select at least that many.`);
        return;
      }
    }
    
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        alert('Please select phone company and model');
        return;
      }
    }
    
    let customizationDetails = '';
    let itemPrice = Number(product.price || 0);
    let itemQuantity = qty;
    
    if (isNewStyleTShirt) {
      // Handle new fabric-based and quantity-based t-shirts
      customizationDetails = `${product.subcategoryName} T-Shirt: Fabric: ${currentVariant.fabric}, Color: ${currentVariant.color}, Size: ${currentVariant.size}, Qty: ${currentVariant.quantity} pcs`;
      itemPrice = currentVariant.unitPrice;
      itemQuantity = currentVariant.quantity;
    } else if (isCustomizedTShirt) {
      const selectedColor = tshirtNeck === 'round' ? tshirtColor : 'N/A';
      customizationDetails = `Material: ${tshirtMaterial}, Neck: ${tshirtNeck}, Color: ${selectedColor}, Size: ${tshirtSize}, Qty: ${qty} pcs`;
      itemPrice = tshirtBasePrice;
    } else if (isSignatureDayTShirt) {
      customizationDetails = `Signature Day T-Shirt, Neck: ${signatureDayTShirtNeck}, Color: ${signatureDaySelectedColor}, Qty: ${qty} pcs`;
      itemPrice = signatureDayBasePrice;
    } else if (isPhoneCase) {
      customizationDetails = `Phone: ${phoneCompany} / ${phoneModel}`;
    } else if (isHamper) {
      customizationDetails = JSON.stringify(hamperItems);
    } else {
      customizationDetails = product.customizationDetails || '';
    }
    
    const item = { ...product, id: product._id || product.id, price: itemPrice, quantity: itemQuantity, customizationDetails, addOn: { type: wrapType, price: wrapPrice }, hamperItems, hamperItemTotal };
    addToCartContext(item);
    navigate('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <picture>
              <source type="image/webp" srcSet={`${encodeURI(mainImage)}?q=60&w=400 400w, ${encodeURI(mainImage)}?q=60&w=800 800w, ${encodeURI(mainImage)}?q=60&w=1200 1200w`} />
              <img loading="lazy" decoding="async" src={encodeURI(mainImage)} srcSet={`${encodeURI(mainImage)}?q=60&w=400 400w, ${encodeURI(mainImage)}?q=60&w=800 800w, ${encodeURI(mainImage)}?q=60&w=1200 1200w`} sizes="(max-width: 768px) 80vw, 40vw" className="w-full h-full object-cover" alt="" />
            </picture>
          </div>

          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setMainImage(img)} className={`w-16 h-16 rounded overflow-hidden border ${img === mainImage ? 'ring-2 ring-brand-blue' : ''}`}>
                  <img src={encodeURI(img)} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="mb-2"><BackButton /></div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark">{product.name}</h1>
          <p className="text-3xl font-bold text-brand-blue">₹{isNewStyleTShirt ? currentVariant.totalPrice : isCustomizedTShirt ? (tshirtBasePrice * qty) : isSignatureDayTShirt ? (signatureDayBasePrice * qty) : (product.price * qty)}</p>
          
          {!isNewStyleTShirt && (
            <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
              <div><span className="block text-sm font-bold text-gray-500 mb-3">QUANTITY</span><div className="flex items-center gap-6"><button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 border rounded-full font-bold bg-white">-</button><span className="text-xl font-bold">{qty}</span><button onClick={() => setQty(qty+1)} className="w-10 h-10 border rounded-full font-bold bg-white">+</button></div></div>
              <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-900 font-bold"><Info size={18}/> Photo Upload: Please send photos on WhatsApp after order.</div>
            </div>
          )}

          {isNewStyleTShirt && product && (
            <ProductVariantSelector 
              product={product} 
              onVariantChange={setCurrentVariant}
            />
          )}

          {isTShirt && !isNewStyleTShirt && (
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 space-y-4">
              <h3 className="text-lg font-bold text-indigo-900">👕 T-Shirt Configuration</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                <select value={tshirtMaterial} onChange={(e) => setTshirtMaterial(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue">
                  <option value="poly-cotton">Poly Cotton (Standard)</option>
                  <option value="pure-cotton">Pure Cotton (Premium)</option>
                  <option value="polyester">Polyester (Quality)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Neck Type</label>
                <select value={tshirtNeck} onChange={(e) => setTshirtNeck(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue">
                  <option value="round">Round Neck (Crew Neck) - ₹50 Less</option>
                  <option value="collar">Collar Neck (Polo) - Base Price</option>
                </select>
              </div>

              {tshirtNeck === 'round' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Color (Round Neck)</label>
                  <div className="flex gap-3 flex-wrap">
                    {roundNeckColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setTshirtColor(color.name)}
                        className={`relative group transition-transform hover:scale-110`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-4 transition ${
                            tshirtColor === color.name
                              ? 'border-brand-blue shadow-lg'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="absolute top-full mt-1 text-xs font-semibold text-gray-700 whitespace-nowrap group-hover:text-brand-blue">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {['M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setTshirtSize(size)}
                      className={`py-3 px-2 rounded-lg border-2 font-bold transition ${
                        tshirtSize === size
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-brand-blue'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-brand-blue/20">
                <p className="text-sm text-gray-600 mb-2">💰 <strong>Quantity-Based Pricing:</strong></p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>1-4 pcs: <span className="font-bold">₹499</span></div>
                  <div>5-9 pcs: <span className="font-bold">₹479</span></div>
                  <div>10-19 pcs: <span className="font-bold">₹459</span></div>
                  <div>20+ pcs: <span className="font-bold">₹419</span></div>
                </div>
                {tshirtNeck === 'round' && <div className="text-xs text-green-600 mt-2">✓ Round neck saves ₹50/pc</div>}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="font-bold text-brand-blue">
                    Your Price: ₹{tshirtBasePrice}/pc × {qty} = <span className="text-xl">₹{tshirtBasePrice * qty}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSignatureDayTShirt && (
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 space-y-4">
              <h3 className="text-lg font-bold text-amber-900">👕 Signature Day T-Shirt Configuration</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Neck Type</label>
                <select value={signatureDayTShirtNeck} onChange={(e) => setSignatureDayTShirtNeck(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="colored">Colored / Collar Neck - Base Price</option>
                  <option value="round">Round Neck - ₹50 Less</option>
                </select>
              </div>

              {signatureDayTShirtNeck === 'colored' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {coloredNeckColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSignatureDaySelectedColor(color.name)}
                        className={`relative group transition-transform hover:scale-110`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-4 transition ${
                            signatureDaySelectedColor === color.name
                              ? 'border-amber-600 shadow-lg'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="absolute top-full mt-1 text-xs font-semibold text-gray-700 whitespace-nowrap group-hover:text-amber-600">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {signatureDayTShirtNeck === 'round' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Color (Round Neck)</label>
                  <div className="flex gap-3 flex-wrap">
                    {roundNeckColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSignatureDaySelectedColor(color.name)}
                        className={`relative group transition-transform hover:scale-110`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-4 transition ${
                            signatureDaySelectedColor === color.name
                              ? 'border-amber-600 shadow-lg'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="absolute top-full mt-1 text-xs font-semibold text-gray-700 whitespace-nowrap group-hover:text-amber-600">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border-2 border-amber-300">
                <p className="text-sm text-gray-600 mb-3">💰 <strong>Quantity-Based Pricing:</strong></p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                  <div>40 pcs: <span className="font-bold">₹179</span></div>
                  <div>50 pcs: <span className="font-bold">₹169</span></div>
                  <div>60-70 pcs: <span className="font-bold">₹159</span></div>
                  <div>70+ pcs: <span className="font-bold">₹149</span></div>
                </div>
                <div className="border-t border-amber-200 pt-3 space-y-1 text-xs text-gray-600">
                  {signatureDayTShirtNeck === 'round' && <p className="text-green-600">✓ Round neck saves ₹50/pc</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="font-bold text-amber-700">
                    Your Price: ₹{signatureDayBasePrice}/pc × {qty} = <span className="text-xl">₹{signatureDayBasePrice * qty}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {isHamper && (
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">🎁 Hamper Items (Optional)</label>
                  <p className="text-xs text-gray-600 mt-1">Add Amazon/Flipkart gift items to customize your hamper. Prices get added to the total.</p>
                  <div className="bg-white p-3 rounded-lg mt-2 border border-blue-100 text-xs text-gray-700">
                    <p className="font-semibold mb-1">Hamper includes by default:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Polaroids</li>
                      <li>Collage photos</li>
                      <li>Lights</li>
                      <li>Frames 4x6</li>
                    </ul>
                  </div>
                </div>
                
                {hamperItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input type="text" placeholder="Product Name/Title" value={item.link} onChange={(e) => { const newItems = [...hamperItems]; newItems[idx].link = e.target.value; setHamperItems(newItems); }} className="flex-1 text-xs px-3 py-2 border rounded focus:outline-none" />
                      <button onClick={() => { const newItems = hamperItems.filter((_, i) => i !== idx); setHamperItems(newItems); setHamperItemTotal(newItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)); }} className="text-red-500 hover:text-red-700 font-bold text-sm">Remove</button>
                    </div>
                    <input type="number" placeholder="enter the amount of the hamper" value={item.price} onChange={(e) => { const newItems = [...hamperItems]; newItems[idx].price = e.target.value; setHamperItems(newItems); setHamperItemTotal(newItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)); }} className="w-full text-xs px-3 py-2 border rounded focus:outline-none" min="0" />
                  </div>
                ))}
                
                <button onClick={() => { setHamperItems([...hamperItems, { link: '', price: 0 }]); }} className="w-full text-sm px-3 py-2 border-2 border-blue-400 text-blue-600 font-semibold rounded-lg hover:bg-blue-50\">
                  + Add Item
                </button>
                
                {hamperItemTotal > 0 && (
                  <div className="bg-green-50 p-2 rounded text-sm font-semibold text-green-700 text-center\">
                    Added Link Product Price: ₹{hamperItemTotal}
                  </div>
                )}
              </div>
            )}

            {isPhoneCase && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Company</label>
                  <select value={phoneCompany} onChange={(e) => { setPhoneCompany(e.target.value); setPhoneModel(''); }} className="w-full px-4 py-3 border rounded focus:outline-none">
                    <option value="">Select Company</option>
                    {Object.keys(phoneCompanies).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Model</label>
                  <select value={phoneModel} onChange={(e) => setPhoneModel(e.target.value)} className="w-full px-4 py-3 border rounded focus:outline-none">
                    <option value="">Select Model</option>
                    {(phoneCompanies[phoneCompany] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Gift Wrap (optional)</label>
              <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="wrap" value="none" checked={wrapType === 'none'} onChange={() => setWrapType('none')} className="w-4 h-4" />
                  <span className="text-sm">None</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="wrap" value="normal" checked={wrapType === 'normal'} onChange={() => setWrapType('normal')} className="w-4 h-4" />
                  <span className="text-sm">Normal Wrap — ₹{computeWrapPrice(product?.price, 'normal')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="wrap" value="premium" checked={wrapType === 'premium'} onChange={() => setWrapType('premium')} className="w-4 h-4" />
                  <span className="text-sm">Premium Wrap — ₹{computeWrapPrice(product?.price, 'premium')}</span>
                </label>
              </div>
            </div>

            <button onClick={handleBuyNow} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">Buy Now</button>
            <button onClick={handleAddToCart} className="w-full bg-gray-200 text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition">Add to Cart</button>

            {/* Professional Share Button */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-full bg-gradient-to-r from-brand-blue to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-3"
              title="Share this product"
            >
              <Share2 size={20} />
              Share this Product
            </button>

            {/* Share Modal */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                      <Share2 size={24} className="text-brand-blue" />
                      Share Product
                    </h3>
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-3">
                    
                    {/* WhatsApp */}
                    <button 
                      onClick={() => {
                        const text = `Check out ${product.name} for ₹${product.price} at Infinity Customizations!\n\n${window.location.href}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition">
                        <svg className="w-6 h-6 text-green-600 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52z"/>
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">WhatsApp</p>
                        <p className="text-xs text-gray-500">Share via WhatsApp</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-green-500 transition" />
                    </button>

                    {/* Instagram */}
                    <button 
                      onClick={() => {
                        const text = `Check out ${product.name} - ${window.location.href}`;
                        window.open(`https://www.instagram.com/?text=${encodeURIComponent(text)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center group-hover:shadow-lg transition">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.265-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">Instagram</p>
                        <p className="text-xs text-gray-500">Share via Instagram Stories</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-500 transition" />
                    </button>

                    {/* Copy Link */}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopyLinkClicked(true);
                        setTimeout(() => setCopyLinkClicked(false), 2000);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-brand-blue transition">
                        {copyLinkClicked ? (
                          <Check size={24} className="text-green-600 group-hover:text-white transition" />
                        ) : (
                          <Copy size={24} className="text-brand-blue group-hover:text-white transition" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">
                          {copyLinkClicked ? 'Copied!' : 'Copy Link'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {copyLinkClicked ? 'Link copied to clipboard' : 'Copy product link to clipboard'}
                        </p>
                      </div>
                      {copyLinkClicked && <Check size={20} className="text-green-600" />}
                    </button>

                    {/* Email */}
                    <button 
                      onClick={() => {
                        const subject = `Check out ${product.name}`;
                        const body = `I found this amazing product: ${product.name} - ${window.location.href}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition">
                        <Mail size={24} className="text-orange-600 group-hover:text-white transition" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">Email</p>
                        <p className="text-xs text-gray-500">Share via email</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition" />
                    </button>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="w-full py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}


            <button type="button" onClick={() => setShowTerms(s => !s)} className="w-full text-sm text-gray-600 hover:text-brand-blue underline">{showTerms ? 'Hide' : 'View'} Return & Refund Policy</button>

            {showTerms && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
                <h4 className="font-bold mb-2">Return & Refund Terms & Conditions</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>All products are customized and made to order. Hence, returns or refunds are not accepted except in cases mentioned below.</li>
                  <li>Returns or replacements are accepted only if the product is 100% damaged at the time of delivery or if a wrong item is received.</li>
                  <li>A clear unboxing video is mandatory to claim any return, replacement, or refund.</li>
                  <li>The unboxing video must clearly show the package being opened and the damaged/wrong product.</li>
                  <li>No claim will be accepted without an unboxing video.</li>
                  <li>All claims must be raised within 24 hours of delivery.</li>
                  <li>If the claim is approved, a replacement will be provided first.</li>
                  <li>Refunds will be processed only if a replacement is not possible.</li>
                </ul>
                <h4 className="font-bold mb-2 mt-4">No Return / No Refund Policy</h4>
                <p className="mb-2">No returns or refunds will be provided in the following cases:</p>
                <ul className="list-disc list-inside mb-2">
                  <li>Minor defects or slight imperfections</li>
                  <li>Change of mind after placing the order</li>
                  <li>Wrong product ordered by the customer</li>
                  <li>Dissatisfaction with color, size, or design</li>
                  <li>Any reason other than complete damage or wrong item received</li>
                </ul>
                <h4 className="font-bold mb-2 mt-4">Color Disclaimer</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>Product colors may vary slightly due to lighting, photography, or screen settings.</li>
                  <li>A 5%–10% color variation from the website images is normal and not considered a defect.</li>
                  <li>By placing an order on our website, the customer agrees to all the above Terms & Conditions.</li>
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
              {reviewsLoading ? (
                <div className="py-6 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-yellow-600">{reviews.length ? (Math.round((reviews.reduce((a,b)=>a+b.rating,0)/reviews.length)*10)/10) : '—'}</div>
                    <div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                      <div className="text-xs text-gray-500">Based on {reviews.length} reviews</div>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="space-y-3">{reviews.slice(0,5).map((r,idx)=> (
                      <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center font-semibold text-sm">{(r.name||'U').charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-sm">{r.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          </div>
                          <div className="text-sm text-yellow-600">{Array.from({length: Math.round(r.rating||0)}).map((_,i)=>(<span key={i}>★</span>))}{Array.from({length:5-Math.round(r.rating||0)}).map((_,i)=>(<span className="text-gray-300" key={i}>★</span>))}</div>
                        </div>
                        <p className="text-sm text-gray-700">{r.comment}</p>
                      </div>
                    ))}</div>
                  )}

                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Leave a Review</h4>
                    <div className="p-3 border rounded text-sm text-gray-600 mb-3">Posting as: <span className="font-semibold">{user?.name || 'Anonymous'}</span>{!isAuthenticated ? ' — please login to post' : ''}</div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Rating (click to select)</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className="text-3xl transition"
                            style={{ color: star <= reviewForm.rating ? '#F59E0B' : '#D1D5DB' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm,comment:e.target.value})} rows={3} className="w-full p-3 border rounded mb-3" placeholder="Write your review (optional)"></textarea>
                    <button onClick={async ()=>{
                      if(!isAuthenticated) { alert('Please login to post a review'); navigate('/login'); return; }
                      try{
                        const productId = product._id || product.id;
                        if(!productId) throw new Error('Product ID not found');
                        const payload = { name: user?.name || 'Anonymous', rating: reviewForm.rating, comment: reviewForm.comment || '' };
                        console.log('Submitting review:', { productId, payload });
                        const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`,{
                          method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
                        });
                        const d = await res.json();
                        console.log('Review response:', d, 'Status:', res.status);
                        if(!res.ok) throw new Error(d?.message || 'Failed to submit review');
                        setReviews(prev=>[d.review || { ...payload, _id: Date.now().toString() }, ...prev]);
                        setReviewForm({ rating:5, comment:'' });
                        alert('Thanks for your review!');
                      }catch(err){console.error('Review error:', err);alert(`Failed to submit review: ${err.message}`)}
                    }} className="w-full px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-700">Submit Review</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <RelatedProducts currentProduct={product} />
    </div>
  );
};

const RelatedProducts = ({ currentProduct }) => {
  if (!currentProduct) return null;
  const related = products.filter(
    p => p.categoryId === currentProduct.categoryId && (p._id || p.id) !== (currentProduct._id || currentProduct.id)
  ).slice(0, 4);
  if (related.length === 0) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <h3 className="text-xl font-bold mb-4 mt-12 text-brand-dark font-serif">Related Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {related.map(p => (
          <SmartLink to={`/product/${p._id || p.id}`} key={p._id || p.id} className="block group">
            <div className="rounded-xl overflow-hidden aspect-[4/5] bg-gray-100">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
            </div>
            <h4 className="font-serif font-bold text-brand-dark text-sm mt-3 truncate">{p.name}</h4>
            <p className="text-brand-blue font-bold text-sm">₹{p.price}</p>
          </SmartLink>
        ))}
      </div>
    </div>
  );
};

const Cart = ({ items, updateQuantity, removeItem }) => {
  const navigate = useNavigate();

  if (items.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center"><h2 className="text-xl font-bold mb-4">Bag is Empty</h2><SmartLink to="/" className="bg-brand-blue text-white px-8 py-3 rounded-full">Shop Now</SmartLink></div>;
  
  const subtotal = items.reduce((acc, item) => {
    const addOnTotal = item.addOn && item.addOn.price ? Number(item.addOn.price) * item.quantity : 0;
    return acc + (Number(item.price || 0) * item.quantity) + addOnTotal;
  }, 0);
  const calcShippingForItems = (items) => {
    let s = 0;
    items.forEach(item => {
      const price = Number(item.price || 0);
      let per = 150;
      if (price < 300) per = 69;
      else if (price <= 500) per = 99;
      else {
        const extra = Math.min(30, Math.max(0, Math.floor((price - 500) / 100) * 10));
        per = 150 + extra;
      }
      s += per * (item.quantity || 1);
    });
    return s;
  };
  const shipping = calcShippingForItems(items);
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Shopping Bag ({items.length})</h2>
        {items.map((item, i) => (
          <div key={item.id || item._id || i} className="bg-white p-4 rounded-xl border flex gap-4 shadow-sm">
            <img loading="lazy" src={item.image} className="w-24 h-24 rounded-lg object-cover" alt="" />
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between font-bold text-gray-800 text-sm"><h3>{item.name}</h3><button onClick={() => removeItem(item.id || item._id)} className="text-gray-400"><Trash2 size={18}/></button></div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center border rounded-md"><button onClick={() => updateQuantity(item.id || item._id, Math.max(1, item.quantity - 1))} className="px-3 py-1">-</button><span className="px-2 font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)} className="px-3 py-1">+</button></div>
                <span className="font-bold text-brand-blue">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
              {item.addOn && item.addOn.price ? <div className="text-base font-semibold text-gray-700 mt-2">({item.addOn.type === 'normal' ? 'Normal Wrap' : 'Premium Wrap'}) ₹{item.addOn.price} x {item.quantity} = ₹{(item.addOn.price * item.quantity).toLocaleString('en-IN')}</div> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-4"><div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24"><div className="flex justify-between font-bold text-lg mb-8"><span>Total Amount</span><span className="text-brand-blue">₹{total.toLocaleString('en-IN')}</span></div><button onClick={() => navigate('/checkout')} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition">Proceed to Checkout</button></div></div>
    </div>
  );
};

// --- 5. MAIN APP WRAPPER ---

const AppContent = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="min-h-screen font-sans bg-brand-light text-brand-dark flex flex-col">
      <Navbar cartCount={cart.length} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/shop/:id" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart items={cart} updateQuantity={updateQuantity} removeItem={removeFromCart} />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/search" element={<SearchResults />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/phone-models" element={<AdminPhoneModels />} />
      </Routes>
      <Footer />
    </div>
  );
};

// --- 6. APP ENTRYPOINT ---

export default function App() {
  const [loading, setLoading] = useState(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            {loading && <GlobalLoader />}
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </LoaderContext.Provider>
  );
}
