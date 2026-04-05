import { useNavigate } from 'react-router';
import { ArrowLeft, Trash2, Star, Heart, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { placeImageMap } from '../data/images';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export function SelectionSummary() {
  const navigate = useNavigate();
  const { selections, removeSelection } = useAppStore();

  const superLiked = selections.filter(s => s.type === 'super-like');
  const liked = selections.filter(s => s.type === 'like');

  const handleRemove = (placeId: string) => {
    removeSelection(placeId);
    toast('Removed from selections');
  };

  const handleGenerateItinerary = () => {
    if (selections.length === 0) {
      toast.error('Please select at least one place!');
      return;
    }
    navigate('/setup');
  };

  const SelectionCard = ({ selection, onRemove }: any) => {
    const images = placeImageMap[selection.place.id] || selection.place.images || [];
    
    return (
      <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={images[0]}
            alt={selection.place.name}
            className="w-full h-full object-cover"
          />
          {selection.type === 'super-like' && (
            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 line-clamp-1">{selection.place.name}</h3>
          <p className="text-sm text-slate-600 mb-2">{selection.place.category}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {selection.place.area}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {selection.place.duration}
            </Badge>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(selection.place.id)}
          className="flex-shrink-0 w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-32">
      {/* Mobile Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Your Selections</h1>
              <p className="text-sm text-slate-600">{selections.length} place{selections.length !== 1 ? 's' : ''} selected</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {selections.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No selections yet</h3>
              <p className="text-slate-600 mb-6">
                Start swiping to discover amazing places!
              </p>
              <Button onClick={() => navigate(-1)} size="lg">
                Go Back to Discovery
              </Button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="all" className="mb-6">
                <TabsList className="w-full grid grid-cols-3 mb-6">
                  <TabsTrigger value="all" className="gap-2">
                    All
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full">
                      {selections.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="super" className="gap-2">
                    <Star className="w-3.5 h-3.5" />
                    Must-See
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full">
                      {superLiked.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="gap-2">
                    <Heart className="w-3.5 h-3.5" />
                    Liked
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full">
                      {liked.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 mt-0">
                  {superLiked.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-purple-600" />
                        <h2 className="text-sm font-semibold text-slate-700">Must-See Places</h2>
                      </div>
                      <div className="space-y-3">
                        {superLiked.map((selection) => (
                          <SelectionCard
                            key={selection.place.id}
                            selection={selection}
                            onRemove={handleRemove}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {liked.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-green-600" />
                        <h2 className="text-sm font-semibold text-slate-700">Liked Places</h2>
                      </div>
                      <div className="space-y-3">
                        {liked.map((selection) => (
                          <SelectionCard
                            key={selection.place.id}
                            selection={selection}
                            onRemove={handleRemove}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="super" className="space-y-3 mt-0">
                  {superLiked.length === 0 ? (
                    <div className="text-center py-16 px-8">
                      <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No must-see places yet</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Use the star button to mark your favorites!
                      </p>
                    </div>
                  ) : (
                    superLiked.map((selection) => (
                      <SelectionCard
                        key={selection.place.id}
                        selection={selection}
                        onRemove={handleRemove}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="liked" className="space-y-3 mt-0">
                  {liked.length === 0 ? (
                    <div className="text-center py-16 px-8">
                      <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No liked places yet</p>
                    </div>
                  ) : (
                    liked.map((selection) => (
                      <SelectionCard
                        key={selection.place.id}
                        selection={selection}
                        onRemove={handleRemove}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Fixed Action Bar */}
        {selections.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 p-6 shadow-lg">
            <Button
              onClick={handleGenerateItinerary}
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Itinerary
            </Button>
            <p className="text-center text-xs text-slate-500 mt-3">
              Create a day-by-day plan from your selections
            </p>
          </div>
        )}
      </div>
    </div>
  );
}