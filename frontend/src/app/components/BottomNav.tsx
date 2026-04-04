import { useNavigate, useLocation } from 'react-router';
import { Home, Map, User } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'trips', label: 'Trips', icon: Map, path: '/trips' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];
  
  const currentPath = location.pathname;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path || 
              (tab.path === '/trips' && currentPath.startsWith('/trip')) ||
              (tab.path === '/profile' && currentPath.startsWith('/profile'));
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 relative py-2 px-6"
              >
                <motion.div
                  className={`relative ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}