import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { chakras } from "@/lib/chakras";

interface ChakraWheelProps {
  size?: number;
  animated?: boolean;
  values?: Record<string, number>;
}

export default function ChakraWheel({ size = 300, animated = false, values }: ChakraWheelProps) {
  const [rotation, setRotation] = useState(0);
  
  // Slowly rotate the wheel if animated is true
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, [animated]);

  // Calculate chakra health/visibility based on values (if provided)
  const getChakraOpacity = (key: string) => {
    if (!values) return 0.75; // Default opacity when no values
    
    const value = values[key] || 5;
    // Scale 1-10 to 0.3-1.0 for visibility
    return 0.3 + (value / 10) * 0.7;
  };

  return (
    <div 
      className="relative rounded-full bg-white shadow-lg flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <motion.div 
        className="w-full h-full rounded-full relative"
        animate={animated ? { rotate: rotation } : {}}
        transition={{ duration: 0.05, ease: "linear" }}
      >
        {/* Chakra layers - with a full circle disc appearance */}
        {chakras.map((chakra, index) => (
          <div 
            key={chakra.key}
            className="absolute w-full h-full rounded-full"
            style={{ 
              opacity: getChakraOpacity(chakra.key),
              background: `conic-gradient(from ${index * 51.4}deg, ${chakra.color} 0deg, ${chakra.color} 51.4deg, transparent 51.41deg, transparent 360deg)`
            }}
          />
        ))}
        
        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full bg-white shadow-inner"
            style={{ width: `${size * 0.25}px`, height: `${size * 0.25}px` }}
          />
        </div>
      </motion.div>
      
      {/* Animated dots representing energy */}
      {animated && (
        <div className="absolute inset-0 z-10">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/80"
              initial={{
                x: size / 2,
                y: size / 2,
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: size / 2 + Math.cos(i * 30 * (Math.PI / 180)) * (size / 2 - 5),
                y: size / 2 + Math.sin(i * 30 * (Math.PI / 180)) * (size / 2 - 5),
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
