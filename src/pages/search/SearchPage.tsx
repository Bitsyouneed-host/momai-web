import { useState } from 'react';
import { Search, MapPin, Star, Phone, Globe, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { searchApi } from '../../api/search';
import { providersApi } from '../../api/providers';
import type { SearchResult, PlaceDetails } from '../../types/search';

const providerTypes = [
  { label: 'Doctor', type: 'doctor' },
  { label: 'Dentist', type: 'dentist' },
  { label: 'Hospital', type: 'hospital' },
  { label: 'Pharmacy', type: 'pharmacy' },
  { label: 'Physical Therapy', type: 'physiotherapist' },
  { label: 'Veterinarian', type: 'veterinary_care' },
  { label: 'Health', type: 'health' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = async (overrideQuery?: string, overrideType?: string) => {
    const q = overrideQuery ?? query;
    const t = overrideType ?? selectedType;
    if (!q.trim() && !t) return;
    setIsLoading(true);
    try {
      const { data } = await searchApi.providers({
        query: q.trim() || t,
        type: t || undefined,
      });
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).providers as SearchResult[]) || [];
        setResults(list);
      }
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (placeId: string) => {
    try {
      const { data } = await searchApi.placeDetails(placeId);
      if (data.success && data.data) {
        const raw = data.data;
        const detail = (raw as unknown as Record<string, unknown>).provider || raw;
        setSelectedPlace(detail as PlaceDetails);
        setIsDetailOpen(true);
      }
    } catch {
      toast.error('Failed to load provider details');
    }
  };

  const handleAddProvider = async () => {
    if (!selectedPlace) return;
    try {
      await providersApi.create({
        name: selectedPlace.name,
        phone: selectedPlace.phone,
        address: { street: selectedPlace.address },
        website: selectedPlace.website,
        preferredContactMethod: 'either',
      });
      toast.success('Provider added to your list');
      setIsDetailOpen(false);
    } catch {
      toast.error('Failed to add provider');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Search Providers</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <StyledInput
            placeholder="Search for providers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <PrimaryButton onClick={() => handleSearch()} isLoading={isLoading} fullWidth={false} className="!px-4">
          <Search size={18} />
        </PrimaryButton>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {providerTypes.map((pt) => (
          <button
            key={pt.type}
            onClick={() => {
              const isDeselecting = selectedType === pt.type;
              const newType = isDeselecting ? '' : pt.type;
              setSelectedType(newType);
              if (!isDeselecting) {
                setQuery(pt.label);
                handleSearch(pt.label, pt.type);
              }
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === pt.type
                ? 'bg-primary text-white'
                : 'bg-white/80 text-text-secondary border border-primary/20'
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Search size={48} />}
          title="Search for Providers"
          message="Find doctors, dentists, salons, and more near you"
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <GlassCard
              key={result.placeId}
              className="!p-4"
              onClick={() => handleViewDetails(result.placeId)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">{result.name}</h3>
                  <p className="text-xs text-text-secondary truncate">{result.address}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {result.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{result.rating}</span>
                      </div>
                    )}
                    {result.openNow !== undefined && (
                      <span className={`text-xs font-medium ${result.openNow ? 'text-success' : 'text-error'}`}>
                        {result.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Provider Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPlace?.name}
        size="lg"
      >
        {selectedPlace && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={14} />
              {selectedPlace.address}
            </div>

            {selectedPlace.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-text-secondary" />
                <a href={`tel:${selectedPlace.phone}`} className="text-sm text-primary-deep hover:underline">
                  {selectedPlace.phone}
                </a>
              </div>
            )}

            {selectedPlace.website && (
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-text-secondary" />
                <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-deep hover:underline truncate">
                  {selectedPlace.website}
                </a>
              </div>
            )}

            {selectedPlace.rating && (
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{selectedPlace.rating}</span>
                <span className="text-xs text-text-secondary">({selectedPlace.userRatingsTotal} reviews)</span>
              </div>
            )}

            {selectedPlace.hours && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">Hours</h4>
                <div className="space-y-0.5">
                  {selectedPlace.hours.map((h, i) => (
                    <p key={i} className="text-xs text-text-secondary">{h}</p>
                  ))}
                </div>
              </div>
            )}

            {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Reviews</h4>
                <div className="space-y-3">
                  {selectedPlace.reviews.slice(0, 3).map((review, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{review.authorName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              size={10}
                              className={j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-3">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <PrimaryButton onClick={handleAddProvider}>
                <span className="flex items-center justify-center gap-2">
                  <Plus size={16} /> Add to My Providers
                </span>
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
