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

// Fallback cover images for cities without uploaded media
const cityImageFallbacks: Record<string, string> = {
  // Mizoram districts — all use the Mizoram cover
  'aizawl': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'lunglei': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'siaha': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'champhai': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'kolasib': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'serchhip': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'lawngtlai': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'mamit': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'khawzawl': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'saitual': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'hnahthial': 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
};

export function Home() {
  const navigate = useNavigate();
  const setSelectedCity = useAppStore((state) => state.setSelectedCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState(mockCities);

  useEffect(() => {
    citiesApi.list().then((res) => {
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(toFrontendCity);
        const withImages = mapped.map(c => {
          const mock = mockCities.find(m => m.name.toLowerCase() === c.name.toLowerCase());
          const fallback = cityImageFallbacks[c.name.toLowerCase()];
          return { ...c, image: c.image || mock?.image || fallback || '' };
        });
        setCities(withImages);
      }
    }).catch(() => {});
  }, []);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    setSelectedCity(cityId, (city as any)?._apiId);
    navigate(`/discover/${cityId}`);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Mobile Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header with Brand */}
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
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-slate-200 bg-white shadow-sm text-base"
            />
          </div>
          
          {searchQuery && filteredCities.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              {filteredCities.map(city => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-sm text-slate-500">{city.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Cities */}
        {!searchQuery && (
          <motion.div 
            className="px-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg font-medium mb-4">Explore Destinations</h2>
            <div className="grid grid-cols-2 gap-4">
              {cities.map((city, index) => (
                <motion.button
                  key={city.id}
                  onClick={() => handleCitySelect(city.id)}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1), duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-semibold mb-1 drop-shadow-lg">{city.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow-md">{city.country}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
      <BottomNav />
    </motion.div>
  );
}