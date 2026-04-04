import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  FileText,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useUserStore } from '../store/userStore';
import { useTripStore } from '../store/tripStore';
import { Button } from '../components/ui/button';
import { AuthGate } from './AuthGate';
import { BottomNav } from '../components/BottomNav';
import { toast } from 'sonner';

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const { trips } = useTripStore();
  const [showAuthGate, setShowAuthGate] = useState(false);
  
  // Show auth gate if not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Welcome to Your Profile</h1>
          <p className="text-slate-600 mb-8">
            Sign in to access your saved trips, preferences, and travel information
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/auth/signup')}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Account
            </Button>
            
            <Button
              onClick={() => navigate('/auth/signin')}
              variant="outline"
              size="lg"
              className="w-full h-12"
            >
              Sign In
            </Button>
          </div>
          
          {/* Feature Preview */}
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Save Your Trips</h3>
                <p className="text-xs text-slate-600">Access your itineraries anytime</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Secure Travel Data</h3>
                <p className="text-xs text-slate-600">Store passport and visa info safely</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Personalized Experience</h3>
                <p className="text-xs text-slate-600">Get recommendations based on preferences</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <BottomNav />
      </div>
    );
  }
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  const savedTripsCount = trips.filter(t => t.status === 'saved').length;
  const draftTripsCount = trips.filter(t => t.status === 'draft').length;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-6 pt-12 pb-24 relative">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold text-white">Profile</h1>
            <button
              onClick={() => toast.info('Settings coming soon!')}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Profile Avatar & Name */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
              {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.fullName || 'Travel Enthusiast'}</h2>
            <p className="text-white/80 text-sm">{user.email || user.phone}</p>
          </div>
        </div>
        
        {/* Stats Card */}
        <div className="px-6 -mt-16 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{trips.length}</div>
                <div className="text-xs text-slate-600">Total Trips</div>
              </div>
              <div className="text-center border-l border-r border-slate-200">
                <div className="text-2xl font-bold text-blue-600">{savedTripsCount}</div>
                <div className="text-xs text-slate-600">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{draftTripsCount}</div>
                <div className="text-xs text-slate-600">Drafts</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Personal Information
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {user.fullName && (
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-slate-500">Full Name</div>
                  <div className="font-medium">{user.fullName}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
            
            {user.email && (
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
            
            {user.phone && (
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-slate-500">Phone</div>
                  <div className="font-medium">{user.phone}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
            
            {user.nationality && (
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-slate-500">Nationality</div>
                  <div className="font-medium">{user.nationality}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
            
            {user.countryOfResidence && (
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-slate-500">Residence</div>
                  <div className="font-medium">{user.countryOfResidence}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Travel Documents */}
        {(user.passport || user.visa) && (
          <div className="px-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Travel Documents
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {user.passport && (
                <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs text-slate-500">Passport</div>
                    <div className="font-medium">{user.passport.country}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              )}
              
              {user.visa && (
                <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs text-slate-500">Visa</div>
                    <div className="font-medium">{user.visa.country} - {user.visa.type}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Settings */}
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Preferences
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <button 
              onClick={() => toast.info('Notifications settings coming soon!')}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-slate-500">Manage your alerts</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            
            <button 
              onClick={() => toast.info('Privacy & Security settings coming soon!')}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Privacy & Security</div>
                <div className="text-xs text-slate-500">Control your data</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            
            <button 
              onClick={() => toast.info('Help & Support coming soon!')}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Help & Support</div>
                <div className="text-xs text-slate-500">Get assistance</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="px-6 mb-8">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="lg"
            className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}