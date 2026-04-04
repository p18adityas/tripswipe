import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Users, Zap, DollarSign, Utensils, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';

export function ItinerarySetup() {
  const navigate = useNavigate();
  const { setItineraryDetails, selections } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    numberOfDays: 3,
    numberOfPeople: 2,
    pace: 'balanced' as 'relaxed' | 'balanced' | 'packed',
    budget: 'moderate' as 'budget' | 'moderate' | 'luxury',
    foodPreference: 'balanced'
  });

  const handleGenerate = () => {
    if (!formData.name.trim()) {
      toast.error('Please give your itinerary a name!');
      return;
    }

    setItineraryDetails({
      name: formData.name,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      numberOfDays: formData.numberOfDays,
      numberOfPeople: formData.numberOfPeople,
      pace: formData.pace,
      budget: formData.budget,
      foodPreference: formData.foodPreference
    });

    toast.success('Generating your itinerary...', { icon: '✨' });
    setTimeout(() => {
      navigate('/itinerary');
    }, 800);
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
              <h1 className="text-xl font-semibold">Trip Details</h1>
              <p className="text-sm text-slate-600">Customize your itinerary</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Itinerary Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Itinerary Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Paris Spring Adventure"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 text-base"
            />
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <Label className="text-base font-semibold">Travel Dates (Optional)</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Number of Days */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Number of Days *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setFormData({ ...formData, numberOfDays: days })}
                  className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                    formData.numberOfDays === days
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          {/* Number of People */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <Label className="text-base font-semibold">Number of Travelers *</Label>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, '5+'].map((people) => (
                <button
                  key={people}
                  onClick={() => setFormData({ 
                    ...formData, 
                    numberOfPeople: typeof people === 'number' ? people : 5
                  })}
                  className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                    formData.numberOfPeople === (typeof people === 'number' ? people : 5)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {people}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Pace */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-slate-600" />
              <Label className="text-base font-semibold">Travel Pace *</Label>
            </div>
            <RadioGroup
              value={formData.pace}
              onValueChange={(value: any) => setFormData({ ...formData, pace: value })}
              className="space-y-3"
            >
              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                <RadioGroupItem value="relaxed" id="relaxed" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="relaxed" className="font-medium cursor-pointer">
                    Relaxed
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    2-3 activities per day, plenty of rest time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                <RadioGroupItem value="balanced" id="balanced" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="balanced" className="font-medium cursor-pointer">
                    Balanced
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    3-4 activities per day with breaks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                <RadioGroupItem value="packed" id="packed" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="packed" className="font-medium cursor-pointer">
                    Packed
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    5+ activities per day, maximize experiences
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <Label className="text-base font-semibold">Budget Level *</Label>
            </div>
            <RadioGroup
              value={formData.budget}
              onValueChange={(value: any) => setFormData({ ...formData, budget: value })}
              className="grid grid-cols-3 gap-3"
            >
              <div className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.budget === 'budget'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}>
                <RadioGroupItem value="budget" id="budget" className="sr-only" />
                <Label htmlFor="budget" className="font-medium cursor-pointer block text-center">
                  Budget
                </Label>
                <p className="text-xs text-slate-600 text-center mt-1">€</p>
              </div>
              <div className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.budget === 'moderate'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}>
                <RadioGroupItem value="moderate" id="moderate" className="sr-only" />
                <Label htmlFor="moderate" className="font-medium cursor-pointer block text-center">
                  Moderate
                </Label>
                <p className="text-xs text-slate-600 text-center mt-1">€€</p>
              </div>
              <div className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.budget === 'luxury'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}>
                <RadioGroupItem value="luxury" id="luxury" className="sr-only" />
                <Label htmlFor="luxury" className="font-medium cursor-pointer block text-center">
                  Luxury
                </Label>
                <p className="text-xs text-slate-600 text-center mt-1">€€€</p>
              </div>
            </RadioGroup>
          </div>

          {/* Food Preference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-slate-600" />
              <Label className="text-base font-semibold">Food Preferences</Label>
            </div>
            <Input
              type="text"
              placeholder="e.g., Vegetarian, No seafood, Local cuisine..."
              value={formData.foodPreference}
              onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 p-6 shadow-lg">
          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate My Itinerary
          </Button>
          <p className="text-center text-xs text-slate-500 mt-3">
            From {selections.length} selected place{selections.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}