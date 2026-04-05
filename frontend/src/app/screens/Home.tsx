import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { cities as mockCities } from '../data/mockData';
import { useAppStore } from '../store/appStore';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/input';
import { BottomNav } from '../components/BottomNav';
import { cities as citiesApi, toFrontendCity } from '../services/api';

const MIZORAM_COVER = 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

// States that should appear as a single top-level destination (grouping their districts)
const STATE_DESTINATIONS: Record<string, { name: string; country: string; image: string }> = {
  'Mizoram': { name: 'Mizoram', country: 'Northeast India', image: MIZORAM_COVER },
};

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  _apiId?: number;
  _documentId?: string;
  _isState?: boolean; // true if this is a state-level destination
  _districtIds?: number[]; // API city IDs that belong to this state
}

export function Home() {
  const navigate = useNavigate();
  const setSelectedCity = useAppStore((state) => state.setSelectedCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    citiesApi.list().then((res) => {
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(toFrontendCity);

        // Separate state-grouped cities from regular cities
        const stateGrouped = new Map<string, Destination>();
        const regularCities: Destination[] = [];

        for (const c of mapped) {
          // Check if this city belongs to a state that should be grouped
          const stateName = c.country.split(',')[0]?.trim(); // e.g. "Mizoram" from "Mizoram, India"
          if (STATE_DESTINATIONS[stateName]) {
            const existing = stateGrouped.get(stateName);
            if (existing) {
              existing._districtIds?.push((c as any)._apiId);
            } else {
              stateGrouped.set(stateName, {
                id: stateName.toLowerCase(),
                name: STATE_DESTINATIONS[stateName].name,
                country: STATE_DESTINATIONS[stateName].country,
                image: STATE_DESTINATIONS[stateName].image,
                _isState: true,
                _districtIds: [(c as any)._apiId],
              });
            }
          } else {
            // Regular city — find mock image fallback
            const mock = mockCities.find(m => m.name.toLowerCase() === c.name.toLowerCase());
            regularCities.push({
              ...c,
              image: c.image || mock?.image || '',
              _isState: false,
            });
          }
        }

        // Combine: regular cities first, then state destinations
        const all = [...regularCities, ...Array.from(stateGrouped.values())];
        setDestinations(all);
        setLoaded(true);
      }
    }).catch(() => {
      // Fallback to mock data
      setDestinations(mockCities.map(c => ({ ...c, _isState: false })));
      setLoaded(true);
    });
  }, []);

  const filteredDestinations = destinations.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationSelect = (dest: Destination) => {
    // Reset previous session's swipes when switching destinations
    useAppStore.getState().reset();

    if (dest._isState) {
      useAppStore.setState({
        selectedCity: dest.id,
        selectedCityApiId: null,
        _stateFilter: dest.name,
        _districtIds: dest._districtIds || [],
      });
      navigate(`/discover/${dest.id}`);
    } else {
      setSelectedCity(dest.id, (dest as any)?._apiId);
      useAppStore.setState({ _stateFilter: null, _districtIds: [] });
      navigate(`/discover/${dest.id}`);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="px-4 pt-12 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TripSwipe
            </h1>
            <p className="text-sm text-slate-500 tracking-wide">
              Plan less. Swipe more.
            </p>
          </div>

          <h2 className="text-2xl tracking-tight mb-2">
            Plan Your Perfect Trip
          </h2>
          <p className="text-slate-600">
            Discover incredible India, one swipe at a time
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="px-4 pb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-slate-200 bg-white shadow-sm text-base"
            />
          </div>

          {searchQuery && filteredDestinations.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              {filteredDestinations.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleDestinationSelect(dest)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{dest.name}</div>
                    <div className="text-sm text-slate-500">{dest.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destinations Grid */}
        {!searchQuery && (
          <motion.div
            className="px-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg font-medium mb-4">Explore Destinations</h2>
            {!loaded && destinations.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {destinations.map((dest, index) => (
                <motion.button
                  key={dest.id}
                  onClick={() => handleDestinationSelect(dest)}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05), duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-semibold mb-1 drop-shadow-lg">{dest.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow-md">{dest.country}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="h-8" />
      </div>
      <BottomNav />
    </motion.div>
  );
}
