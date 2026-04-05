import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Undo2, SlidersHorizontal, Heart } from 'lucide-react';
import { places as mockPlaces, cities as mockCities, Place } from '../data/mockData';
import { useAppStore } from '../store/appStore';
import { PlaceCard, ActionButtons } from '../components/PlaceCard';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { places as placesApi, toFrontendPlace } from '../services/api';

const filterOptions = [
  { id: 'attractions', label: 'Attractions' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'museums', label: 'Museums' },
  { id: 'neighborhoods', label: 'Neighborhoods' },
  { id: 'activities', label: 'Activities' },
  { id: 'hidden-gems', label: 'Hidden Gems' },
  { id: 'food', label: 'Food & Dining' },
];

export function Discovery() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const {
    selections,
    discarded,
    addSelection,
    addDiscard,
    undo,
    history,
    selectedCityApiId,
  } = useAppStore();

  const { _stateFilter, _districtIds } = useAppStore();
  const city = mockCities.find(c => c.id === cityId);
  const destinationName = _stateFilter || city?.name || cityId;
  const [cityPlaces, setCityPlaces] = useState<Place[]>(
    mockPlaces.filter(p => p.cityId === cityId)
  );
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch places from API
  useEffect(() => {
    if (!cityId) return;
    setLoading(true);

    // State-level destination: fetch by state name (all districts)
    if (_stateFilter) {
      placesApi.list(`filters[city][state][name]=${_stateFilter}&pagination[pageSize]=100&sort=popularity_score:desc`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setCityPlaces(res.data.map(p => toFrontendPlace(p) as unknown as Place));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    // City-level destination
    const apiCityId = selectedCityApiId || parseInt(cityId);
    if (!apiCityId || isNaN(apiCityId)) {
      const cityName = city?.name;
      if (cityName) {
        placesApi.list(`filters[city][name]=${cityName}&pagination[pageSize]=50&sort=popularity_score:desc`)
          .then(res => {
            if (res.data && res.data.length > 0) {
              setCityPlaces(res.data.map(p => toFrontendPlace(p) as unknown as Place));
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    placesApi.byCity(apiCityId, undefined, 1, 50)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCityPlaces(res.data.map(p => toFrontendPlace(p) as unknown as Place));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityId, selectedCityApiId, _stateFilter]);

  const availablePlaces = cityPlaces.filter(
    place => !selections.some(s => s.place.id === place.id) && !discarded.includes(place.id)
  );

  const currentPlace = availablePlaces[currentIndex];

  useEffect(() => {
    if (!city && !_stateFilter && !loading) {
      navigate('/');
    }
  }, [city, _stateFilter, loading, navigate]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [cityId]);

  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    if (!currentPlace) return;

    if (direction === 'left') {
      addDiscard(currentPlace.id);
      toast('Skipped', { icon: '👎' });
    } else if (direction === 'right') {
      addSelection(currentPlace, 'like');
      toast('Liked!', { icon: '❤️' });
    } else if (direction === 'super') {
      addSelection(currentPlace, 'super-like');
      toast('Super Liked!', { icon: '⭐' });
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      undo();
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
      toast('Undone!', { icon: '↩️' });
    }
  };

  const handleViewDetail = () => {
    if (currentPlace) {
      navigate(`/place/${currentPlace.id}`);
    }
  };

  const handleReviewSelections = () => {
    if (selections.length === 0) {
      toast.error('Please select at least one place first!');
      return;
    }
    navigate('/summary');
  };

  if (!city && !_stateFilter) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="font-semibold">{destinationName}</h1>
            <p className="text-xs text-slate-500">
              {currentIndex + 1} / {cityPlaces.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReviewSelections}
              className="relative"
            >
              <Heart className="w-5 h-5" />
              {selections.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {selections.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters and Undo */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {appliedFilters.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {appliedFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[70vh] flex flex-col">
              <SheetHeader>
                <SheetTitle>Filter Places</SheetTitle>
                <SheetDescription>Choose the type of places you want to see.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-6 space-y-4 px-4">
                {filterOptions.map(option => (
                  <div key={option.id} className="flex items-center gap-3">
                    <Checkbox
                      id={option.id}
                      checked={appliedFilters.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAppliedFilters([...appliedFilters, option.id]);
                        } else {
                          setAppliedFilters(appliedFilters.filter(f => f !== option.id));
                        }
                      }}
                    />
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 pb-2 px-4 flex gap-2 border-t bg-white">
                <Button
                  variant="outline"
                  onClick={() => setAppliedFilters([])}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </Button>
          )}
        </div>
      </div>

      {/* Card Stack */}
      <div className="px-4 pt-6 pb-4">
        <div className="relative w-full mx-auto max-w-md" style={{ height: 'calc(100vh - 280px)' }}>
          {availablePlaces.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              {/* Icon/Graphic */}
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white fill-white" />
                  </div>
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-4 -left-4 w-5 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Message */}
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                You're All Caught Up!
              </h3>
              <p className="text-slate-600 mb-2 text-lg">
                You've explored everything in {destinationName} 🎉
              </p>
              <p className="text-slate-500 mb-8 text-sm">
                {selections.length > 0 
                  ? `Ready to create your itinerary with ${selections.length} selected place${selections.length !== 1 ? 's' : ''}?`
                  : 'Go back and start swiping to discover amazing places!'
                }
              </p>

              {/* CTA Button */}
              {selections.length > 0 ? (
                <Button onClick={handleReviewSelections} size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Heart className="w-5 h-5" />
                  Create My Itinerary
                </Button>
              ) : (
                <Button onClick={() => navigate('/')} variant="outline" size="lg" className="gap-2">
                  Explore Other Destinations
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Stack of cards (show up to 3 for depth effect) */}
              {availablePlaces.slice(currentIndex, currentIndex + 3).map((place, index) => (
                <div
                  key={place.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 10 - index,
                    transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
                    opacity: 1 - index * 0.3,
                    pointerEvents: index === 0 ? 'auto' : 'none'
                  }}
                >
                  <PlaceCard
                    place={place}
                    onSwipe={handleSwipe}
                    onTap={handleViewDetail}
                    isTop={index === 0}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {currentPlace && (
        <ActionButtons
          onDiscard={() => handleSwipe('left')}
          onLike={() => handleSwipe('right')}
          onSuperLike={() => handleSwipe('super')}
        />
      )}
    </div>
  );
}