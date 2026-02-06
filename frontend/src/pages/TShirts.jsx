import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { products as allProducts } from '../data';

const materials = ['Poly Cotton', 'Pure Cotton', 'Polyester'];
const necks = ['Round Neck', 'Collar Neck'];
const sizes = ['M', 'L', 'XL', 'XXL'];
const quantityPacks = [1,2,3,4,5,10,20];

const priceForPack = (qty) => {
  if (qty >= 20) return 419;
  if (qty >= 10) return 459;
  if (qty >= 5) return 479;
  return 499;
};

const TShirts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Build variants (6 combinations)
  const variants = useMemo(() => {
    const baseImage = (allProducts.find(p => p.categoryId === 'apparel') || {}).image || '/images/CUSTOMIZED T-SHIRTS 499.jpg';
    const list = [];
    materials.forEach(mat => {
      necks.forEach(neck => {
        list.push({
          id: `${mat.replace(/\s+/g,'').toLowerCase()}-${neck.replace(/\s+/g,'').toLowerCase()}`,
          material: mat,
          neck: neck,
          name: `${mat} – ${neck}`,
          image: baseImage
        });
      });
    });
    return list;
  }, []);

  return (
    <div className="min-h-screen bg-brand-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">T-Shirts</h1>
            <p className="text-gray-600">Choose material, neck style, size and quantity packs. Prices update automatically.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Material</label>
            <div className="flex gap-2">
              {materials.map(m => (
                <button key={m} data-filter-material={m} className="px-3 py-2 bg-gray-100 rounded text-sm">{m}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Neck</label>
            <div className="flex gap-2">
              {necks.map(n => (
                <button key={n} data-filter-neck={n} className="px-3 py-2 bg-gray-100 rounded text-sm">{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {variants.map(variant => (
            <VariantCard key={variant.id} variant={variant} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

const VariantCard = ({ variant, addToCart }) => {
  const [size, setSize] = useState('M');
  const [qtyPack, setQtyPack] = useState(1);

  const pricePer = priceForPack(qtyPack);
  const total = pricePer * qtyPack;

  const handleAdd = () => {
    const item = {
      id: `${variant.id}-${size}-${qtyPack}-${Date.now()}`,
      productName: `T-Shirt — ${variant.name}`,
      name: `T-Shirt — ${variant.name}`,
      material: variant.material,
      neck: variant.neck,
      size,
      price: pricePer,
      quantity: qtyPack,
      image: variant.image
    };
    addToCart(item);
    alert('Added to cart');
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="aspect-[4/3] mb-4 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
      </div>
      <h3 className="font-bold text-lg mb-1">{variant.name}</h3>
      <p className="text-sm text-gray-600 mb-3">Available Sizes: M / L / XL / XXL</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <select value={size} onChange={(e) => setSize(e.target.value)} className="px-3 py-2 border rounded">
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={qtyPack} onChange={(e) => setQtyPack(Number(e.target.value))} className="px-3 py-2 border rounded">
          {quantityPacks.map(q => <option key={q} value={q}>{q} {q>1? 'pieces': 'piece'}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">Price per T-Shirt</div>
          <div className="font-bold text-lg">₹{pricePer}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="font-bold text-lg">₹{total}</div>
        </div>
      </div>

      <button onClick={handleAdd} className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold">Add to Cart</button>
    </div>
  );
};

export default TShirts;
