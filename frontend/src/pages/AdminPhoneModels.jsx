import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';
import BackButton from '../components/BackButton';

const AdminPhoneModels = () => {
  const navigate = useNavigate();
  const { admin, adminToken } = useAuth();
  const [phoneCompanies, setPhoneCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ company: '', models: [] });
  const [newModel, setNewModel] = useState('');
  const [expandedCompany, setExpandedCompany] = useState(null);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchPhoneModels();
  }, [admin, navigate]);

  const fetchPhoneModels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/phone-models/admin/all`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPhoneCompanies(data);
    } catch (error) {
      console.error('Error fetching phone models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminToken) {
      alert('Not authenticated');
      return;
    }

    try {
      const url = editingId ? `${API_BASE_URL}/phone-models/${editingId}` : `${API_BASE_URL}/phone-models`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      await fetchPhoneModels();
      resetForm();
    } catch (error) {
      console.error('Error saving phone company:', error);
      alert(error.message);
    }
  };

  const handleEdit = (company) => {
    setEditingId(company._id);
    setFormData({ company: company.company, models: [...company.models] });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/phone-models/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error('Delete failed');
      await fetchPhoneModels();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company');
    }
  };

  const handleAddModel = async (companyId) => {
    if (!newModel.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/phone-models/${companyId}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ model: newModel })
      });

      if (!res.ok) throw new Error('Failed');
      await fetchPhoneModels();
      setNewModel('');
    } catch (error) {
      console.error('Error adding model:', error);
      alert('Failed to add model');
    }
  };

  const handleRemoveModel = async (companyId, model) => {
    if (!window.confirm(`Remove "${model}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/phone-models/${companyId}/models/${encodeURIComponent(model)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error('Failed');
      await fetchPhoneModels();
    } catch (error) {
      console.error('Error removing model:', error);
      alert('Failed to remove model');
    }
  };

  const resetForm = () => {
    setFormData({ company: '', models: [] });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-dark mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Phone Models Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage phone companies and models for phone cases</p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Company
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Company Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-dark">
                {editingId ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., Apple, Samsung, Xiaomi"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Models</label>
                <div className="space-y-2 mb-4">
                  {formData.models.map((model, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm font-medium">{model}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.models.filter((_, i) => i !== idx);
                          setFormData({ ...formData, models: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter model name (e.g., iPhone 14 Pro)"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newModel.trim() && !formData.models.includes(newModel.trim())) {
                          setFormData({
                            ...formData,
                            models: [...formData.models, newModel.trim()]
                          });
                          setNewModel('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newModel.trim() && !formData.models.includes(newModel.trim())) {
                        setFormData({
                          ...formData,
                          models: [...formData.models, newModel.trim()]
                        });
                        setNewModel('');
                      }
                    }}
                    className="px-4 py-3 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-lg transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-semibold"
                >
                  {editingId ? 'Update Company' : 'Add Company'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : phoneCompanies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500 text-lg mb-4">No phone companies added yet</p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add First Company
                </button>
              )}
            </div>
          ) : (
            phoneCompanies.map((company) => (
              <div key={company._id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setExpandedCompany(expandedCompany === company._id ? null : company._id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${expandedCompany === company._id ? 'rotate-180' : ''}`}
                      />
                      <h3 className="text-xl font-bold text-brand-dark">{company.company}</h3>
                      <span className="ml-auto text-sm text-gray-500 font-medium">
                        {company.models.length} models
                      </span>
                    </button>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-2 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(company._id)}
                        className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedCompany === company._id && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {company.models.map((model) => (
                          <div
                            key={model}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm">{model}</span>
                            <button
                              onClick={() => handleRemoveModel(company._id, model)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <input
                          type="text"
                          placeholder="Add new model..."
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              handleAddModel(company._id);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            if (input.value.trim()) {
                              handleAddModel(company._id);
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPhoneModels;
