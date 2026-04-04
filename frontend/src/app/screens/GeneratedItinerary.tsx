import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Utensils, 
  Plus, 
  Trash2,
  Save,
  Edit2,
  Users,
  Zap,
  DollarSign,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useTripStore } from '../store/tripStore';
import { useUserStore } from '../store/userStore';
import { placeImageMap } from '../data/images';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../components/ui/sheet';
import { AuthGate } from './AuthGate';
import { toast } from 'sonner';
import { cities } from '../data/mockData';

interface ItineraryItem {
  id: string;
  placeId: string;
  placeName: string;
  category: string;
  time: string;
  duration: string;
  area: string;
  isMeal?: boolean;
  notes?: string;
}

export function GeneratedItinerary() {
  const navigate = useNavigate();
  const { selections, itineraryDetails } = useAppStore();
  const { createTrip } = useTripStore();
  const { user, isAuthenticated, setPendingAction } = useUserStore();
  const { tripId } = useParams();
  const location = useLocation();

  // Generate day-by-day itinerary from selections
  const generateDayByDay = () => {
    if (!itineraryDetails) return {};
    
    const days: Record<number, ItineraryItem[]> = {};
    const superLiked = selections.filter(s => s.type === 'super-like');
    const liked = selections.filter(s => s.type === 'like');
    const allSelections = [...superLiked, ...liked];

    const itemsPerDay = itineraryDetails.pace === 'relaxed' ? 3 : 
                       itineraryDetails.pace === 'balanced' ? 4 : 5;

    let currentDay = 1;
    let dayItems: ItineraryItem[] = [];
    let currentTime = 9; // Start at 9 AM

    allSelections.forEach((selection, index) => {
      const place = selection.place;
      const durationHours = parseInt(place.duration.split('-')[0]) || 2;
      
      // Add place
      dayItems.push({
        id: `${currentDay}-${index}`,
        placeId: place.id,
        placeName: place.name,
        category: place.category,
        time: `${currentTime}:00`,
        duration: place.duration,
        area: place.area
      });

      currentTime += durationHours;

      // Add meal break if appropriate time
      if (currentTime >= 12 && currentTime < 14 && !dayItems.some(i => i.isMeal && i.time.startsWith('12'))) {
        dayItems.push({
          id: `${currentDay}-meal-${index}`,
          placeId: 'meal',
          placeName: 'Lunch Break',
          category: 'Meal',
          time: `${currentTime}:00`,
          duration: '1 hour',
          area: place.area,
          isMeal: true
        });
        currentTime += 1;
      }

      // Move to next day if we've reached the items per day limit
      if (dayItems.length >= itemsPerDay || currentTime >= 19) {
        days[currentDay] = dayItems;
        currentDay++;
        dayItems = [];
        currentTime = 9;
        
        if (currentDay > itineraryDetails.numberOfDays) {
          return; // Stop if we've filled all days
        }
      }
    });

    // Add any remaining items
    if (dayItems.length > 0 && currentDay <= itineraryDetails.numberOfDays) {
      days[currentDay] = dayItems;
    }

    return days;
  };

  const [itinerary, setItinerary] = useState(generateDayByDay());
  const [currentDay, setCurrentDay] = useState(1);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authAction, setAuthAction] = useState<'save' | 'share'>('save');
  const { selectedCity } = useAppStore();

  const handleRemoveItem = (dayNum: number, itemId: string) => {
    setItinerary(prev => ({
      ...prev,
      [dayNum]: prev[dayNum].filter(item => item.id !== itemId)
    }));
    toast('Item removed');
  };

  const handleGenerateLink = () => {
    // Generate a mock shareable link
    const tripId = Math.random().toString(36).substr(2, 9);
    const link = `${window.location.origin}/shared/${tripId}`;
    setShareLink(link);
    toast.success('Share link created!', { icon: '🔗' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!', { icon: '📋' });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itineraryDetails?.name || 'My Trip Itinerary',
          text: `Check out my ${itineraryDetails?.numberOfDays}-day trip itinerary!`,
          url: shareLink
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSave = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setAuthAction('save');
      setPendingAction({ type: 'save', context: { itinerary, itineraryDetails, selections } });
      setShowAuthGate(true);
      return;
    }
    
    // Get city info
    const city = cities.find(c => c.id === selectedCity);
    const coverImage = selections[0]?.place ? (placeImageMap[selections[0].place.id]?.[0] || '') : '';
    
    // Convert itinerary to days format
    const days = Object.entries(itinerary).map(([dayNum, items]) => ({
      dayNumber: parseInt(dayNum),
      items: items.map((item: ItineraryItem) => ({
        id: item.id,
        place: selections.find(s => s.place.id === item.placeId)?.place || {
          id: item.placeId,
          name: item.placeName,
          category: item.category,
          area: item.area,
          duration: item.duration,
          description: '',
          tags: [],
          rating: 0,
          reviews: 0
        },
        startTime: item.time,
        endTime: '',
        duration: parseInt(item.duration.split('-')[0]) || 2,
        type: (item.isMeal ? 'meal' : 'activity') as 'activity' | 'meal' | 'travel',
        notes: item.notes
      }))
    }));
    
    // Create trip
    const tripId = createTrip({
      title: itineraryDetails?.name || 'My Trip',
      cityId: selectedCity || '',
      cityName: city?.name || 'Unknown',
      status: 'saved',
      coverImage,
      itineraryDetails: itineraryDetails!,
      days,
      selections
    });
    
    toast.success('Trip saved!', {
      description: 'You can access it anytime from your trips',
      icon: '💾'
    });
    
    setTimeout(() => {
      navigate('/trips');
    }, 1500);
  };

  const handleShare = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setAuthAction('share');
      setPendingAction({ type: 'share', context: { itinerary, itineraryDetails, selections } });
      setShowAuthGate(true);
      return;
    }
    
    setShowShareSheet(true);
  };

  if (!itineraryDetails) {
    navigate('/setup');
    return null;
  }

  const dayNumbers = Object.keys(itinerary).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-32">
      {/* Mobile Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold">{itineraryDetails.name}</h1>
              </div>
              <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <Button size="icon" variant="ghost">
                <Edit2 className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Trip Summary */}
            <div className="flex items-center gap-3 flex-wrap text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{itineraryDetails.numberOfDays} days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{itineraryDetails.numberOfPeople} {itineraryDetails.numberOfPeople === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span className="capitalize">{itineraryDetails.pace}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span className="capitalize">{itineraryDetails.budget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        {dayNumbers.length > 0 && (
          <div className="px-6 py-4 bg-white border-b border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {dayNumbers.map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setCurrentDay(dayNum)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                    currentDay === dayNum
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Day {dayNum}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Content */}
        <div className="px-6 py-6">
          {dayNumbers.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No itinerary items yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itinerary[currentDay]?.map((item, index) => {
                const images = item.placeId !== 'meal' ? (placeImageMap[item.placeId] || []) : [];
                
                return (
                  <div key={item.id} className="relative">
                    {/* Timeline connector */}
                    {index < itinerary[currentDay].length - 1 && (
                      <div className="absolute left-11 top-20 w-0.5 h-[calc(100%+1rem)] bg-slate-200" />
                    )}
                    
                    <div className="flex gap-4">
                      {/* Time indicator */}
                      <div className="flex flex-col items-center flex-shrink-0 w-20">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {item.time.split(':')[0]}
                        </div>
                        <span className="text-xs text-slate-500 mt-1">{item.time}</span>
                      </div>

                      {/* Item card */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {!item.isMeal && images[0] && (
                          <div className="relative h-32">
                            <ImageWithFallback
                              src={images[0]}
                              alt={item.placeName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{item.placeName}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                {item.isMeal ? (
                                  <Utensils className="w-4 h-4" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                                <span>{item.area}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(currentDay, item.id)}
                              className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                            <Badge variant="secondary">{item.category}</Badge>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>{item.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add more button */}
              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Add Activity</span>
              </button>
            </div>
          )}
        </div>

        {/* Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 p-6 shadow-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Edit Details
            </Button>
            <Button
              size="lg"
              onClick={handleSave}
              className="flex-1 gap-2"
            >
              <Save className="w-5 h-5" />
              Save Itinerary
            </Button>
          </div>
        </div>
        
        {/* Auth Gate Modal */}
        <AuthGate
          open={showAuthGate}
          onClose={() => setShowAuthGate(false)}
          action={authAction}
        />

        {/* Share Sheet */}
        <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
          <SheetContent side="bottom" className="max-h-[75vh]">
            <SheetHeader className="pb-0">
              <SheetTitle>Share Itinerary</SheetTitle>
              <SheetDescription>
                Share your {itineraryDetails.numberOfDays}-day trip with friends, family, or fellow travelers.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto mt-6 space-y-6 pb-6">
              {/* Trip Preview Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                <h3 className="font-semibold mb-2">{itineraryDetails.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{itineraryDetails.numberOfDays} days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{itineraryDetails.numberOfPeople} {itineraryDetails.numberOfPeople === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{selections.length} places</span>
                  </div>
                </div>
              </div>

              {/* Permission Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Share Permissions</label>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">View Only</h4>
                    <p className="text-sm text-slate-600">
                      Anyone with the link can view your itinerary
                    </p>
                  </div>
                </div>
              </div>

              {shareLink && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-slate-100 px-3 py-2.5 rounded-lg text-sm font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {!shareLink ? (
                  <Button
                    size="lg"
                    onClick={handleGenerateLink}
                    className="w-full gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Create Share Link
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleNativeShare}
                    className="w-full gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Link
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}