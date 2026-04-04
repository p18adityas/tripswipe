import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/button';

export function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const action = location.state?.action;
  
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  const handleContinue = () => {
    // Return to the original action
    if (action?.type === 'save') {
      navigate('/itinerary', { state: { shouldSave: true } });
    } else if (action?.type === 'share') {
      navigate('/itinerary', { state: { shouldShare: true } });
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Welcome Aboard! 🎉
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/90 mb-8 text-lg"
        >
          Your profile is all set up. Let's continue where you left off!
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-12 bg-white text-blue-600 hover:bg-white/90 font-semibold"
          >
            {action?.type === 'save' ? 'Save My Trip' : action?.type === 'share' ? 'Share My Trip' : 'Continue'}
          </Button>
          
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white text-sm"
          >
            Go to Home
          </button>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2 text-white/60 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start exploring amazing destinations</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
