import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { products as localProducts } from '../data';

const useQuery = () => new URLSearchParams(useLocation().search);

export default function SearchResults() {
  const query = useQuery();
  const q = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      if (!q.trim()) { setResults([]); setLoading(false); return; }
      try {
        // Prefer a server-side search endpoint if available
        const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          // Accept array or { results: [] }
          const filtered = Array.isArray(data) ? data : (data.results || []);
          setResults(filtered);
        } else {
          // Fallback to narrower server query (if server supports filtering)
          const res2 = await fetch(`${API_BASE_URL}/products?q=${encodeURIComponent(q)}`);
          if (res2.ok) {
            const all = await res2.json();
            setResults(all.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())));
          } else {
            setResults(localProducts.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())));
          }
        }
      } catch (err) {
        const filtered = localProducts.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase()));
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  return (
    <div className="min-h-screen bg-brand-light py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search results for “{q}”</h1>
        {loading ? (
          <p>Searching...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-lg text-center">No products found. Try a different keyword.</div>
            ) : results.map(p => (
              <Link to={`/product/${p._id || p.id}`} key={p._id || p.id} className="block bg-white rounded-lg border p-3">
                <div className="h-40 overflow-hidden bg-gray-50 mb-2">
                  <picture>
                    <source type="image/webp" srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} />
                    <img loading="lazy" decoding="async" src={p.image} srcSet={`${p.image}?q=60&w=400 400w, ${p.image}?q=60&w=800 800w`} sizes="(max-width: 768px) 50vw, 25vw" alt={p.name} className="w-full h-full object-cover" />
                  </picture>
                </div>
                <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                <div className="text-brand-blue font-bold">₹{p.price}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}