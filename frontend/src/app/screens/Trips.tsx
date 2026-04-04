import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useTripStore, TripStatus, Trip } from '../store/tripStore';
import { useUserStore } from '../store/userStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { BottomNav } from '../components/BottomNav';

const statusTabs: { id: TripStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Drafts' },
  { id: 'saved', label: 'Saved' },
  { id: 'shared', label: 'Shared' },
  { id: 'archived', label: 'Archived' }
];

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    saved: 'bg-blue-100 text-blue-700',
    shared: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-600'
  };
  
  const statusLabels = {
    draft: 'Draft',
    saved: 'Saved',
    shared: 'Shared',
    archived: 'Archived'
  };
  
  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
            {statusLabels[trip.status]}
          </span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 text-left">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{trip.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{trip.cityName}</span>
          </div>
          
          {trip.itineraryDetails.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(trip.itineraryDetails.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>{trip.days.length} day{trip.days.length !== 1 ? 's' : ''}</span>
            {trip.itineraryDetails.numberOfPeople && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{trip.itineraryDetails.numberOfPeople}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(trip.updatedAt)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function Trips() {
  const navigate = useNavigate();
  const { trips, setCurrentTrip, fetchTrips, loading } = useTripStore();
  const { isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState<TripStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch trips from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
    }
  }, [isAuthenticated]);
  
  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesTab = activeTab === 'all' || trip.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.cityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  }).sort((a, b) => b.updatedAt - a.updatedAt);
  
  const handleTripClick = (tripId: string) => {
    setCurrentTrip(tripId);
    navigate(`/trip/${tripId}`);
  };
  
  const handleCreateNewTrip = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto pb-20">
        {/* Header */}
        <motion.div
          className="px-4 pt-12 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
              <p className="text-sm text-slate-600 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            
            <Button
              onClick={handleCreateNewTrip}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search trips by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-white"
            />
          </div>
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Trip List */}
        <div className="px-4">
          {filteredTrips.length === 0 ? (
            <motion.div
              className="text-center py-16 px-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No trips found' : 'No trips yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Start planning your first adventure'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreateNewTrip}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Trip
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TripCard trip={trip} onClick={() => handleTripClick(trip.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}