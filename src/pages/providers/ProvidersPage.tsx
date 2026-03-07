import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Plus, Star, Phone, MapPin, Globe, Mail, Trash2, Loader2, X, Wand2,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import EmptyState from '../../components/ui/EmptyState';
import { providersApi } from '../../api/providers';
import type { Provider } from '../../types/provider';

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProviders = async () => {
    try {
      const { data } = await providersApi.list();
      if (data.success && data.data) setProviders(data.data);
    } catch { /* ignore */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  const filtered = providers.filter((p) => {
    if (showFavoritesOnly && !p.isFavorite) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.businessType?.toLowerCase().includes(q));
    }
    return true;
  });

  const toggleFavorite = async (id: string) => {
    try {
      await providersApi.toggleFavorite(id);
      setProviders((prev) => prev.map((p) => p._id === id ? { ...p, isFavorite: !p.isFavorite } : p));
      if (selectedProvider?._id === id) {
        setSelectedProvider((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
    } catch { toast.error('Failed to update favorite'); }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('Delete this provider?')) return;
    try {
      await providersApi.delete(id);
      setProviders((prev) => prev.filter((p) => p._id !== id));
      setSelectedProvider(null);
      toast.success('Provider deleted');
    } catch { toast.error('Failed to delete provider'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">My Providers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-primary/15 hover:bg-primary/25 rounded-xl transition-colors"
        >
          <Plus size={20} className="text-primary-deep" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-3 rounded-xl border transition-colors ${
            showFavoritesOnly
              ? 'bg-warning/15 border-warning/30 text-warning'
              : 'bg-white/80 border-primary/15 text-muted'
          }`}
        >
          <Star size={18} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Provider List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Phone size={48} />}
          title={searchQuery || showFavoritesOnly ? 'No Matches' : 'No Providers'}
          message={searchQuery || showFavoritesOnly ? 'Try a different search or filter' : 'Add providers from Search or manually'}
          action={
            <PrimaryButton onClick={() => setShowAddModal(true)} fullWidth={false} className="!py-3 !px-6">
              Add Provider
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <GlassCard key={p._id} className="!p-4" onClick={() => setSelectedProvider(p)}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">{p.name}</div>
                  {p.businessType && (
                    <div className="text-xs text-text-secondary">{p.businessType}</div>
                  )}
                  {p.phone && (
                    <div className="text-xs text-muted mt-0.5">{p.phone}</div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p._id); }}
                  className="p-1.5"
                >
                  <Star
                    size={18}
                    className={p.isFavorite ? 'text-warning' : 'text-muted'}
                    fill={p.isFavorite ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setSelectedProvider(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">{selectedProvider.name}</h2>
              <button onClick={() => setSelectedProvider(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-muted" />
              </button>
            </div>

            {selectedProvider.businessType && (
              <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary-deep text-xs font-medium">
                {selectedProvider.businessType}
              </span>
            )}

            <div className="space-y-3">
              {selectedProvider.phone && (
                <a href={`tel:${selectedProvider.phone}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-primary-deep">
                  <Phone size={16} className="text-primary-deep" /> {selectedProvider.phone}
                </a>
              )}
              {selectedProvider.email && (
                <a href={`mailto:${selectedProvider.email}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-primary-deep">
                  <Mail size={16} className="text-primary-deep" /> {selectedProvider.email}
                </a>
              )}
              {selectedProvider.website && (
                <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-primary hover:text-primary-deep">
                  <Globe size={16} className="text-primary-deep" /> {selectedProvider.website}
                </a>
              )}
              {selectedProvider.address && (
                <div className="flex items-start gap-3 text-sm text-text-primary">
                  <MapPin size={16} className="text-primary-deep shrink-0 mt-0.5" />
                  <span>{[selectedProvider.address.street, selectedProvider.address.city, selectedProvider.address.state, selectedProvider.address.zipCode].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {selectedProvider.notes && (
                <p className="text-sm text-text-secondary bg-gray-50 rounded-xl p-3">{selectedProvider.notes}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => toggleFavorite(selectedProvider._id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/15 text-sm font-medium text-text-primary hover:bg-gray-50"
              >
                <Star size={16} className={selectedProvider.isFavorite ? 'text-warning' : 'text-muted'} fill={selectedProvider.isFavorite ? 'currentColor' : 'none'} />
                {selectedProvider.isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  navigate('/booking/new', { state: { providerName: selectedProvider.name, providerPhone: selectedProvider.phone } });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent to-pink-500 text-white text-sm font-medium"
              >
                <Wand2 size={16} /> Book with AI
              </button>
            </div>

            <button
              onClick={() => deleteProvider(selectedProvider._id)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-error text-sm font-medium hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete Provider
            </button>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddModal && <AddProviderModal onClose={() => setShowAddModal(false)} onAdded={() => { setShowAddModal(false); fetchProviders(); }} />}
    </div>
  );
}

function AddProviderModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Provider name is required'); return; }
    setIsSaving(true);
    try {
      const { data } = await providersApi.create({
        name: name.trim(),
        phone: phone.trim() || undefined,
        businessType: businessType.trim() || undefined,
        address: address.trim() ? { street: address.trim() } : undefined,
        notes: notes.trim() || undefined,
      });
      if (data.success) {
        toast.success('Provider added');
        onAdded();
      } else {
        toast.error(data.message || 'Failed to add provider');
      }
    } catch { toast.error('Failed to add provider'); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Add Provider</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Provider Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            placeholder="Business Type (e.g. Dentist)"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <PrimaryButton onClick={handleSave} isLoading={isSaving}>
          Add Provider
        </PrimaryButton>
      </div>
    </div>
  );
}
