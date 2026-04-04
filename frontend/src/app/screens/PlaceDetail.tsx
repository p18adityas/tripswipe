import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Heart, X, Star, Clock, MapPin, DollarSign, Calendar } from 'lucide-react';
import { places } from '../data/mockData';
import { useAppStore } from '../store/appStore';
import { placeImageMap } from '../data/images';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function PlaceDetail() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { addSelection, addDiscard, selections } = useAppStore();
  
  const place = places.find(p => p.id === placeId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!place) {
    navigate(-1);
    return null;
  }

  const images = placeImageMap[place.id] || [];
  const isSelected = selections.some(s => s.place.id === place.id);

  const handleDiscard = () => {
    addDiscard(place.id);
    toast('Skipped', { icon: '👎' });
    navigate(-1);
  };

  const handleLike = () => {
    if (!isSelected) {
      addSelection(place, 'like');
      toast('Liked!', { icon: '❤️' });
    }
    navigate(-1);
  };

  const handleSuperLike = () => {
    if (!isSelected) {
      addSelection(place, 'super-like');
      toast('Super Liked!', { icon: '⭐' });
    }
    navigate(-1);
  };

  const categoryColors: Record<string, string> = {
    'Attraction': 'bg-blue-500',
    'Museum': 'bg-purple-500',
    'Restaurant': 'bg-orange-500',
    'Neighborhood': 'bg-green-500',
    'Activity': 'bg-pink-500',
    'Landmark': 'bg-indigo-500',
    'Food Market': 'bg-red-500',
    'Park': 'bg-emerald-500',
    'Beach': 'bg-cyan-500'
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Image Gallery */}
      <div className="relative h-[50vh] bg-slate-100">
        <ImageWithFallback
          src={images[currentImageIndex]}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        
        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Category and Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`px-3 py-1.5 rounded-full text-white text-sm font-medium ${categoryColors[place.category] || 'bg-slate-500'}`}>
            {place.category}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{place.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold mb-4">{place.name}</h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {place.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-600 text-center font-medium">{place.area}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-600 text-center font-medium">{place.duration}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-600 text-center font-medium">{place.priceLevel}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">About</h2>
          <p className="text-slate-700 leading-relaxed">
            {place.detailedDescription}
          </p>
        </div>

        {/* Additional Info */}
        {place.openHours && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-900 mb-1">Opening Hours</p>
              <p className="text-sm text-blue-700">{place.openHours}</p>
            </div>
          </div>
        )}

        {place.bestTime && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-amber-900 mb-1">Best Time to Visit</p>
              <p className="text-sm text-amber-700">{place.bestTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDiscard}
            className="w-16 h-16 rounded-full border-2 border-red-100 hover:bg-red-50"
            disabled={isSelected}
          >
            <X className="w-7 h-7 text-red-500" />
          </Button>
          
          <Button
            size="lg"
            onClick={handleSuperLike}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-xl transition-shadow"
            disabled={isSelected}
          >
            <Star className="w-9 h-9 text-white fill-white" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleLike}
            className="w-16 h-16 rounded-full border-2 border-green-100 hover:bg-green-50"
            disabled={isSelected}
          >
            <Heart className="w-7 h-7 text-green-500 fill-green-500" />
          </Button>
        </div>
        
        {isSelected && (
          <p className="text-center text-sm text-slate-500 mt-3">
            Already added to your selections
          </p>
        )}
      </div>
    </div>
  );
}
