import { useNavigate } from 'react-router';
import { X, Bookmark, Share2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface AuthGateProps {
  open: boolean;
  onClose: () => void;
  action: 'save' | 'share';
}

export function AuthGate({ open, onClose, action }: AuthGateProps) {
  const navigate = useNavigate();
  
  const handleContinue = () => {
    navigate('/auth/signup');
  };
  
  const handleSignIn = () => {
    navigate('/auth/signin');
  };
  
  const benefits = action === 'save' ? [
    { icon: Bookmark, text: 'Save itineraries and access them anytime' },
    { icon: Clock, text: 'Continue planning across multiple sessions' },
    { icon: Share2, text: 'Share trips with friends and family' }
  ] : [
    { icon: Share2, text: 'Share your trip with others via link' },
    { icon: Bookmark, text: 'Keep a copy saved in your account' },
    { icon: Clock, text: 'Update and manage your trip later' }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">
          {action === 'save' ? 'Save Your Trip' : 'Share Your Trip'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create an account to {action === 'save' ? 'save your itinerary and access it anytime' : 'share your trip with others via link'}
        </DialogDescription>
        
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-8 pt-12 pb-8 text-white">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                {action === 'save' ? (
                  <Bookmark className="w-8 h-8" />
                ) : (
                  <Share2 className="w-8 h-8" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {action === 'save' ? 'Save Your Trip' : 'Share Your Trip'}
              </h2>
              <p className="text-white/90 text-sm">
                Create an account to unlock the full experience
              </p>
            </motion.div>
          </div>
          
          {/* Benefits */}
          <div className="px-8 py-6 space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-slate-700 pt-2">{benefit.text}</p>
                </motion.div>
              );
            })}
          </div>
          
          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Create Account
            </Button>
            
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="w-full h-12"
              size="lg"
            >
              Sign In
            </Button>
            
            <p className="text-center text-xs text-slate-500 mt-4">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}