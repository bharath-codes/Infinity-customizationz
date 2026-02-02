import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { storyCategories, showcaseData, products, categoryDetails, phoneModelOptions } from './data';
import { ShoppingCart, Menu, X, Search, User, Heart, ChevronRight, Phone, Mail, Instagram, Truck, ShieldCheck, Gift, Star, ArrowRight, MessageCircle, Filter, CheckCircle, AlertCircle, Info, ChevronDown, Trash2, ArrowLeft, LogOut } from 'lucide-react';
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
import Checkout from './pages/Checkout';
import SearchResults from './pages/SearchResults';

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
      Infinitly<span className="text-brand-gold">Loading</span>
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
  <div className="bg-brand-blue text-white text-[10px] md:text-xs py-2 overflow-hidden relative z-50">
    <div className="animate-marquee font-bold tracking-widest uppercase flex gap-8">
      <span>🎉 FREE SHIPPING on orders above ₹999</span> <span>• New Service: Custom ID Cards & NFC</span>
    </div>
  </div>
);

const Navbar = ({ cartCount }) => {
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
    <nav className="bg-white text-brand-dark sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-gray-800" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          <SmartLink to="/" className="flex-shrink-0">
             <div className="h-10 w-28 md:h-12 md:w-36 overflow-hidden relative">
               <img src="/images/logo.png" alt="Infinitly" className="w-full h-full object-cover object-center scale-110" />
             </div>
          </SmartLink>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 items-center text-gray-500 focus-within:bg-white transition-all">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-brand-dark" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); }} />
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-gray-700">
          <a href="https://wa.me/918985993948" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-green-600 transition hover:scale-110"><WhatsAppIcon size={22} /></a>
          <button className="md:hidden text-gray-700" onClick={() => { const t = prompt('Search'); if (t && t.trim()) navigate(`/search?q=${encodeURIComponent(t.trim())}`); }}><Search size={22} /></button>
          
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-700 hover:text-brand-blue transition">
                <User size={24} />
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg border-b">📋 My Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b">📦 My Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <SmartLink to="/login" className="flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 transition">
              <User size={24} />
            </SmartLink>
          )}
          
          <SmartLink to="/cart" className="relative text-gray-700 hover:text-brand-blue transition hover:scale-110">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-brand-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">{cartCount}</span>}
          </SmartLink>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 absolute w-full left-0 shadow-xl z-50">
          <SmartLink to="/" className="block font-bold text-brand-blue" onClick={() => setIsOpen(false)}>Home</SmartLink>
          <SmartLink to="/shop/frames" className="block text-gray-600" onClick={() => setIsOpen(false)}>Photo Frames</SmartLink>
          <SmartLink to="/shop/apparel" className="block text-gray-600" onClick={() => setIsOpen(false)}>Apparel</SmartLink>
          {isAuthenticated ? (
            <>
              <SmartLink to="/profile" className="block text-gray-600" onClick={() => setIsOpen(false)}>👤 My Profile</SmartLink>
              <SmartLink to="/orders" className="block text-gray-600" onClick={() => setIsOpen(false)}>📦 My Orders</SmartLink>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <SmartLink to="/login" className="block text-brand-blue font-semibold" onClick={() => setIsOpen(false)}>Login</SmartLink>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-blue text-white pt-16 pb-8 border-t border-brand-gold/20 mt-auto">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div>
        <h2 className="text-2xl font-serif font-bold text-white mb-4">Infinitly<span className="text-brand-gold text-xs ml-1 font-sans tracking-widest">CUSTOMIZATIONS</span></h2>
        <p className="text-blue-100 text-sm leading-relaxed mb-6">Premium custom printing & digital services delivered across India.</p>
        <div className="flex gap-4">
          <a href="https://instagram.com/infinitycustomizations" target="_blank" rel="noreferrer" aria-label="Instagram" className="cursor-pointer hover:text-brand-gold">
            <Instagram />
          </a>
          <a href="https://wa.me/918985993948" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="cursor-pointer hover:text-green-400">
            <WhatsAppIcon />
          </a>
          <a href="mailto:infinitycustomizations@gmail.com" className="cursor-pointer hover:text-brand-gold" aria-label="Email">
            <Mail />
          </a>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-gold mb-6 font-serif">Quick Links</h3>
        <ul className="space-y-3 text-sm text-blue-100">
          <li><SmartLink to="/shop/frames" className="hover:text-white">Photo Frames</SmartLink></li>
          <li><SmartLink to="/shop/apparel" className="hover:text-white">Apparel & IDs</SmartLink></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-gold mb-6 font-serif">Contact</h3>
        <div className="space-y-4 text-sm text-blue-100">
          <p className="flex items-start gap-3"><Phone size={18} /><span>+91 89859 93948</span></p>
          <p className="flex items-start gap-3"><Mail size={18} /><span>infinitycustomizations@gmail.com</span></p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-gold mb-6 font-serif">Admin</h3>
        <ul className="space-y-3">
          <li>
            <SmartLink to="/admin/login" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/20 hover:bg-brand-gold/30 rounded-lg text-sm font-semibold text-brand-gold border border-brand-gold/40 transition-all duration-200">
              <User size={16} />
              Admin Login
            </SmartLink>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 text-center text-xs text-blue-200">
      <p>© 2026 Infinitly Customizations. All rights reserved.</p>
    </div>
  </footer>
);

// --- 4. HOME PAGE COMPONENTS ---

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([
    { id: 1, image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=60&w=1200", title: "Flat 20% Off", link: "/shop/frames" },
    { id: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=60&w=1200", title: "New Arrival: Tees", link: "/shop/apparel" },
    { id: 3, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=60&w=1200", title: "Luxury Hampers", link: "/shop/bouquets" }
  ]);

  useEffect(() => {
    // Fetch showcase images from first category (frames)
    const fetchShowcaseImages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/frames/showcase-images`);
        const data = await res.json();
        
        if (data.images && data.images.filter(img => img).length > 0) {
          // Use fetched images as slides
          const showcaseSlides = data.images
            .filter(img => img) // Filter out null values
            .map((img, idx) => ({
              id: idx + 1,
              image: img,
              title: data.categoryTitle || "Featured Items",
              link: `/shop/frames`
            }));
          
          if (showcaseSlides.length > 0) {
            setSlides(showcaseSlides);
          }
        }
      } catch (err) {
        console.log('Using default slides - showcase images not available');
        // Keep default slides if fetch fails
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
              <source type="image/webp" srcSet={`${s.image}?q=60&w=400 400w, ${s.image}?q=60&w=800 800w, ${s.image}?q=60&w=1200 1200w`} />
              <img loading="lazy" decoding="async" src={s.image} srcSet={`${s.image}?q=60&w=400 400w, ${s.image}?q=60&w=800 800w, ${s.image}?q=60&w=1200 1200w`} sizes="100vw" className="w-full h-full object-cover" alt="" />
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

const ShowcaseCard = ({ product, activeIdx }) => {
  if (!product) return null;
  const productId = product._id || product.id;
  const images = product.images || [product.image];
  const location = useLocation();
  const hidePriceOnHome = location.pathname === '/';
  return (
    <SmartLink to={`/product/${productId}`} className="block group w-full">
      <div className="relative w-full aspect-[4/5] md:h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
        <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${(activeIdx % images.length) * 100}%)` }}>
          {images.map((img, i) => (
            <div key={i} className="min-w-full h-full relative">
              <picture>
                <source type="image/webp" srcSet={`${img}?q=60&w=400 400w, ${img}?q=60&w=800 800w, ${img}?q=60&w=1200 1200w`} />
                <img loading="lazy" decoding="async" src={img} srcSet={`${img}?q=60&w=400 400w, ${img}?q=60&w=800 800w, ${img}?q=60&w=1200 1200w`} sizes="100vw" className="w-full h-full object-cover" alt="" />
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

const CuratedCategorySection = ({ categoryId, categoryTitle }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch showcase products for this category from database
  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      try {
        // Get category data
        const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        const data = await res.json();
        
        console.log(`Category ${categoryId}:`, data.showcaseProducts);
        
        if (data.showcaseProducts && data.showcaseProducts.length > 0) {
          try {
            // Fetch all showcase products by their IDs from the API
            const productPromises = data.showcaseProducts.map(productId =>
              fetch(`${API_BASE_URL}/products/${productId}`)
                .then(r => r.ok ? r.json() : null)
            );
            const prods = await Promise.all(productPromises);
            const validProds = prods.filter(p => p !== null);
            console.log(`Category ${categoryId} showcase products loaded:`, validProds.length);
            setShowcaseProducts(validProds.length > 0 ? validProds : []);
          } catch (fetchErr) {
            console.log('Could not fetch showcase products:', fetchErr);
            setShowcaseProducts([]);
          }
        } else {
          console.log(`Category ${categoryId} has no showcase products`);
          setShowcaseProducts([]);
        }
      } catch (err) {
        console.log('Error fetching category:', err);
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
          {showcaseProducts.map(p => <ShowcaseCard key={p._id} product={p} activeIdx={activeIdx} />)}
        </div>
      </div>
    </section>
  );
};

// --- 5. PAGES ---

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
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide snap-x">
          {products.slice(0, 5).map((p) => {
            const productId = p._id || p.id;
            return (
              <SmartLink to={`/product/${productId}`} key={productId} className="min-w-[140px] md:min-w-[200px] snap-start bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
                <div className="h-40 md:h-60 overflow-hidden relative bg-gray-50">
                  <picture>
                    <source type="image/webp" srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} />
                    <img loading="lazy" decoding="async" src={p.image} srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} sizes="(max-width: 768px) 50vw, 20vw" alt={p.name} className="w-full h-full object-cover" />
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
      </section>
      <div className="space-y-2 pb-12">
        {showcaseCategories.map((cat) => (
          <CuratedCategorySection 
            key={cat.categoryId} 
            categoryId={cat.categoryId} 
            categoryTitle={cat.categoryTitle} 
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
        console.log('Error fetching products:', err);
        // Fallback to local data
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
              <SmartLink to={`/product/${productId}`} key={productId} className="block group">
                <div className="rounded-xl overflow-hidden aspect-[4/5] bg-gray-100">
                  <picture>
                    <source type="image/webp" srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} />
                    <img loading="lazy" decoding="async" src={p.image} srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} sizes="(max-width: 768px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [phoneCompany, setPhoneCompany] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  const isPhoneCase = product && (product.id === 'case1' || (product.name || '').toLowerCase().includes('phone case'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try to fetch from API first
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setMainImage(data.image || data.images?.[0] || "");
        } else {
          // Fallback to local data
          const localProduct = products.find(item => item.id === id);
          setProduct(localProduct);
          if (localProduct) {
            setMainImage(localProduct.image);
          }
        }
      } catch (err) {
        console.log('Error fetching product:', err);
        // Fallback to local data
        const localProduct = products.find(item => item.id === id);
        setProduct(localProduct);
        if (localProduct) {
          setMainImage(localProduct.image);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => { 
    if (product) { 
      setSelectedVariant(product.variants ? product.variants[0] : null); 
      setMainImage(product.image || product.images?.[0] || "");
    } 
  }, [product]);

  const handleAddToCart = () => {
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        alert('Please select phone company and model');
        return;
      }
    }
    const customizationDetails = isPhoneCase ? `Phone: ${phoneCompany} / ${phoneModel}` : (product.customizationDetails || '');
    const item = { ...product, id: product._id || product.id, price: Number(product.price || 0), quantity: qty, customizationDetails };
    addToCartContext(item);
    alert('Added to cart');
  };

  const handleBuyNow = () => {
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        alert('Please select phone company and model');
        return;
      }
    }
    const customizationDetails = isPhoneCase ? `Phone: ${phoneCompany} / ${phoneModel}` : (product.customizationDetails || '');
    const item = { ...product, id: product._id || product.id, price: Number(product.price || 0), quantity: qty, customizationDetails };
    addToCartContext(item);
    navigate('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <picture>
            <source type="image/webp" srcSet={`${mainImage}?q=60&w=400 400w, ${mainImage}?q=60&w=800 800w, ${mainImage}?q=60&w=1200 1200w`} />
            <img loading="lazy" decoding="async" src={mainImage} srcSet={`${mainImage}?q=60&w=400 400w, ${mainImage}?q=60&w=800 800w, ${mainImage}?q=60&w=1200 1200w`} sizes="(max-width: 768px) 80vw, 40vw" className="w-full h-full object-cover" alt="" />
          </picture>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark">{product.name}</h1>
          <p className="text-3xl font-bold text-brand-blue">₹{product.price * qty}</p>
          <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
             <div><span className="block text-sm font-bold text-gray-500 mb-3">QUANTITY</span><div className="flex items-center gap-6"><button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 border rounded-full font-bold bg-white">-</button><span className="text-xl font-bold">{qty}</span><button onClick={() => setQty(qty+1)} className="w-10 h-10 border rounded-full font-bold bg-white">+</button></div></div>
             <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-900 font-bold"><Info size={18}/> Photo Upload: Please send photos on WhatsApp after order.</div>
          </div>
          <div className="space-y-3">
            {isPhoneCase && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Company</label>
                  <select value={phoneCompany} onChange={(e) => { setPhoneCompany(e.target.value); setPhoneModel(''); }} className="w-full px-4 py-3 border rounded focus:outline-none">
                    <option value="">Select Company</option>
                    {Object.keys(phoneModelOptions).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Model</label>
                  <select value={phoneModel} onChange={(e) => setPhoneModel(e.target.value)} className="w-full px-4 py-3 border rounded focus:outline-none">
                    <option value="">Select Model</option>
                    {(phoneModelOptions[phoneCompany] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button onClick={handleBuyNow} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">Buy Now</button>
            <button onClick={handleAddToCart} className="w-full bg-gray-200 text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition">Add to Cart</button>

            <button type="button" onClick={() => setShowTerms(s => !s)} className="w-full text-sm text-gray-600 hover:text-brand-blue underline">{showTerms ? 'Hide' : 'View'} Return & Refund Policy</button>

            {showTerms && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
                <h4 className="font-bold mb-2">Return & Refund Policy</h4>
                <p className="mb-2">Returns or replacements are accepted only if the product is completely damaged (100% damaged) at the time of delivery.</p>
                <p className="mb-2">A clear unboxing video proof is mandatory to claim any return or replacement.</p>
                <p className="mb-2">Without proper video proof, no refund or replacement will be provided.</p>
                <p className="mb-2">Claims must be raised within 24 hours of delivery.</p>
                <p className="mb-2">No returns or refunds for:</p>
                <ul className="list-disc list-inside mb-2">
                  <li>Minor defects</li>
                  <li>Change of mind</li>
                  <li>Wrong order placed</li>
                  <li>Dissatisfaction with color, size, or design</li>
                </ul>
                <p className="mb-2">If approved, replacement will be provided. Refunds will be processed only if replacement is not possible.</p>
                <p className="mb-0">By placing an order, you agree to this policy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ items, updateQuantity, removeItem }) => {
  const navigate = useNavigate();

  if (items.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center"><h2 className="text-xl font-bold mb-4">Bag is Empty</h2><SmartLink to="/" className="bg-brand-blue text-white px-8 py-3 rounded-full">Shop Now</SmartLink></div>;
  
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 100;
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
                <span className="font-bold text-brand-blue">₹{Number(item.price) * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-4"><div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24"><div className="flex justify-between font-bold text-lg mb-8"><span>Total Amount</span><span className="text-brand-blue">₹{total}</span></div><button onClick={() => navigate('/checkout')} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition">Proceed to Checkout</button></div></div>
    </div>
  );
};

// --- 6. MAIN APP WRAPPER ---

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
      </Routes>
      <Footer />
    </div>
  );
};

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