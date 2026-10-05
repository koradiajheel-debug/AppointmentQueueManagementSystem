import React, { useState, useEffect } from 'react';

export const SplashLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0F4C5C] dark:bg-[#061A1D] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ease-out">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-300/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center animate-fadeIn duration-1000">

        {/* Brand Text - Elegant Cursive */}
        <h1 
          className="text-6xl md:text-7xl font-medium text-white tracking-wide mb-3 drop-shadow-xl" 
          style={{ fontFamily: "'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive" }}
        >
          4pixels
        </h1>
        
        {/* Subtitle / Tagline */}
        <div className="flex items-center gap-3 text-teal-100/90 text-sm uppercase tracking-[0.25em] font-light mt-2">
          <span className="w-12 h-px bg-teal-200/40" />
          <span>Smart Queue Management System</span>
          <span className="w-12 h-px bg-teal-200/40" />
        </div>
        
        {/* Cute loading dots */}
        <div className="mt-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2.5 h-2.5 rounded-full bg-emerald-300" 
              style={{ 
                animation: 'pulse 1.5s infinite ease-in-out',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
