import { useState, useRef, TouchEvent, MouseEvent } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Heart, X, Star, Clock, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Place } from '../data/mockData';
import { placeImageMap } from '../data/images';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

interface PlaceCardProps {
  place: Place;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  onTap: () => void;
  isTop: boolean;
}

export function PlaceCard({ place, onSwipe, onTap, isTop }: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const images = placeImageMap[place.id] || place.images || [];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setExitDirection(direction);
      setTimeout(() => onSwipe(direction), 200);
    } else {
      x.set(0);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
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
    <motion.div
      ref={cardRef}
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={onTap}
      animate={exitDirection ? { 
        x: exitDirection === 'right' ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.3 }
      } : {}}
      className="absolute inset-0 cursor-pointer"
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Image Section */}
        <div className="relative h-[55%] bg-slate-100">
          <ImageWithFallback
            src={images[currentImageIndex]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image navigation indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          {currentImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1.5 rounded-full text-white text-xs font-medium ${categoryColors[place.category] || 'bg-slate-500'}`}>
              {place.category}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-2 line-clamp-2">{place.name}</h2>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {place.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
            {place.description}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-col items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 text-center line-clamp-1">{place.area}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 text-center">{place.duration}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 text-center">{place.priceLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ActionButtonsProps {
  onDiscard: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

export function ActionButtons({ onDiscard, onLike, onSuperLike }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-4 px-6 z-10">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDiscard}
        className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-red-100 hover:bg-red-50 transition-colors"
      >
        <X className="w-7 h-7 text-red-500" />
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
      >
        <Star className="w-9 h-9 text-white fill-white" />
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-green-100 hover:bg-green-50 transition-colors"
      >
        <Heart className="w-7 h-7 text-green-500 fill-green-500" />
      </motion.button>
    </div>
  );
}
