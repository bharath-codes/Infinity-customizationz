import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';

const ProductVariantSelector = ({ product, onVariantChange }) => {
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(product.minimumOrderQuantity || 1);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [priceBreakdown, setPriceBreakdown] = useState('');

  // Initialize with first options
  useEffect(() => {
    if (product.fabrics && product.fabrics.length > 0) {
      setSelectedFabric(product.fabrics[0]);
      setCurrentPrice(product.fabrics[0].price);
    } else {
      setCurrentPrice(product.price);
    }

    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }

    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }

    if (product.minimumOrderQuantity > 1) {
      setQuantity(product.minimumOrderQuantity);
    }
  }, [product]);

  // Update price when fabric changes
  useEffect(() => {
    if (selectedFabric) {
      const fabricPrice = selectedFabric.price || product.price;
      setCurrentPrice(fabricPrice);

      // Calculate pricing based on quantity for quantity-based pricing
      if (product.pricingType === 'quantity-based' && product.quantityBasedPricing) {
        const applicablePricing = [...product.quantityBasedPricing]
          .sort((a, b) => b.quantity - a.quantity)
          .find(p => quantity >= p.quantity);

        if (applicablePricing) {
          setCurrentPrice(applicablePricing.price);
          setPriceBreakdown(`(${quantity} units @ ₹${applicablePricing.price}/pc)`);
        }
      }
    }
  }, [selectedFabric, quantity, product]);

  const handleQuantityChange = (newQty) => {
    if (product.minimumOrderQuantity && newQty < product.minimumOrderQuantity) {
      return;
    }
    setQuantity(newQty);
  };

  const getVariantDetails = () => {
    return {
      fabric: selectedFabric?.name || 'Default',
      color: selectedColor || '',
      size: selectedSize || '',
      quantity: quantity,
      unitPrice: currentPrice,
      totalPrice: currentPrice * quantity
    };
  };

  useEffect(() => {
    onVariantChange?.(getVariantDetails());
  }, [selectedFabric, selectedColor, selectedSize, quantity, currentPrice]);

  const isMOQProduct = product.minimumOrderQuantity && product.minimumOrderQuantity > 1;
  const isFabricBasedPricing = product.pricingType === 'fabric-based';
  const isQuantityBasedPricing = product.pricingType === 'quantity-based';

  return (
    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 space-y-6">
      <h3 className="text-lg font-bold text-indigo-900">👕 {product.subcategoryName || 'Product'} Configuration</h3>

      {/* Fabric Selection */}
      {product.fabrics && product.fabrics.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            🧵 Fabric Type
            {isFabricBasedPricing && <span className="text-indigo-600"> (Pricing varies)</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {product.fabrics.map((fabric, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFabric(fabric)}
                className={`p-4 border-2 rounded-lg font-semibold transition text-center ${
                  selectedFabric?.name === fabric.name
                    ? 'border-indigo-600 bg-indigo-100 text-indigo-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                }`}
              >
                <div className="font-bold">{fabric.name}</div>
                <div className="text-sm text-indigo-900 font-semibold">₹{fabric.price}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">🎨 Color</label>
          <div className="grid grid-cols-2 gap-3">
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(color)}
                className={`p-3 border-2 rounded-lg font-semibold transition ${
                  selectedColor === color
                    ? 'border-indigo-600 bg-indigo-100 text-indigo-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">📏 Size</label>
          <div className="grid grid-cols-3 gap-2">
            {product.sizes.map((size, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSize(size)}
                className={`p-3 border-2 rounded-lg font-bold transition text-center ${
                  selectedSize === size
                    ? 'border-indigo-600 bg-indigo-100 text-indigo-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection with MOQ */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📦 Quantity
          {isMOQProduct && (
            <span className="text-red-600"> (Min: {product.minimumOrderQuantity} pieces)</span>
          )}
        </label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => handleQuantityChange(Math.max(product.minimumOrderQuantity || 1, quantity - 1))}
            className="w-10 h-10 border-2 border-indigo-300 rounded-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition"
          >
            −
          </button>
          <input
            type="number"
            min={product.minimumOrderQuantity || 1}
            value={quantity}
            onChange={(e) => handleQuantityChange(Math.max(product.minimumOrderQuantity || 1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-2 border-indigo-300 rounded-lg p-2 font-bold text-lg focus:outline-none focus:border-indigo-600"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-10 h-10 border-2 border-indigo-300 rounded-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition"
          >
            +
          </button>
        </div>

        {/* Quantity-based pricing tiers */}
        {isQuantityBasedPricing && product.quantityBasedPricing && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
            <p className="text-xs font-bold text-gray-600 mb-2">💰 Bulk Pricing Tiers:</p>
            <div className="space-y-1">
              {product.quantityBasedPricing.map((tier, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2 rounded ${
                    quantity >= tier.quantity ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'
                  }`}
                >
                  {tier.quantity}+ pieces: ₹{tier.price}/pc
                  {quantity >= tier.quantity && <Check size={14} className="inline ml-2" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOQ Warning */}
      {isMOQProduct && quantity < product.minimumOrderQuantity && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex gap-2">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 font-semibold">
            Minimum order quantity is {product.minimumOrderQuantity} pieces. Current: {quantity} pieces.
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-white p-4 rounded-lg border-2 border-indigo-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-700">Unit Price:</span>
          <span className="text-lg font-bold text-indigo-600">₹{currentPrice}</span>
        </div>
        {priceBreakdown && (
          <div className="text-xs text-gray-600 mb-3">{priceBreakdown}</div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Total Price:</span>
            <span className="text-2xl font-bold text-indigo-600">₹{currentPrice * quantity}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">({quantity} × ₹{currentPrice})</p>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantSelector;
