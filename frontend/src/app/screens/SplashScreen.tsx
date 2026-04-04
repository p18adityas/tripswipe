import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import splashImage1 from '../../assets/dcd32f97533cf0f556416ad2e51fde39709f967a.png';
import splashImage2 from '../../assets/411f6a1ce6d82d3eb9b35c25462b5dc32e031518.png';
import splashImage3 from '../../assets/8b36630a3e853e290c8a14534902797367195aec.png';

const splashImages = [splashImage1, splashImage2, splashImage3];

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [randomImage] = useState(() => {
    // Select a random image on component mount
    return splashImages[Math.floor(Math.random() * splashImages.length)];
  });
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 3.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3500);

    // Complete after exit animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Animated Background Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{
          duration: 4,
          ease: "easeOut"
        }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${randomImage})` }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isExiting ? 0 : 1, 
          y: isExiting ? -20 : 0 
        }}
        transition={{
          delay: isExiting ? 0 : 0.3,
          duration: isExiting ? 0.5 : 0.8,
          ease: "easeOut"
        }}
      >
        {/* App Name */}
        <motion.h1
          className="text-6xl font-bold text-white mb-4 tracking-tight text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          TripSwipe
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl text-white/90 font-light tracking-wide text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.8,
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          Plan less. Swipe more.
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          className="mt-12 w-16 h-1 bg-white/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1,
            duration: 0.4
          }}
        >
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              delay: 1,
              duration: 2.5,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}