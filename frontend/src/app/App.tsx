import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SplashScreen } from './screens/SplashScreen';

function App() {
  // Always show splash screen on app load
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-8">
        {/* Mobile Frame */}
        <div className="relative w-full max-w-[430px] h-[932px] max-h-[95vh] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-slate-950">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
          
          {/* Screen */}
          <div className="relative w-full h-full bg-white overflow-hidden">
            <SplashScreen onComplete={handleSplashComplete} />
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-8">
      {/* Mobile Frame */}
      <div className="relative w-full max-w-[430px] h-[932px] max-h-[95vh] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-slate-950">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-white overflow-y-auto overflow-x-hidden">
          <RouterProvider router={router} />
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50" />
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;