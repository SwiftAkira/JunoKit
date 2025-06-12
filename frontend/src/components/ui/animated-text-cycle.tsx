import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedTextCycle({
  words,
  interval = 5000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  // Get the width of the current word
  useEffect(() => {
    if (measureRef.current) {
      const elements = measureRef.current.children;
      if (elements.length > currentIndex) {
        // Add a small buffer (10px) to prevent text wrapping
        const newWidth = elements[currentIndex].getBoundingClientRect().width;
        setWidth(`${newWidth}px`);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  // Container animation for the whole word - wheel/cylinder effect
  const containerVariants = {
    hidden: { 
      y: -30,
      opacity: 0,
      filter: "blur(10px)"
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
        y: { duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0 }, // Immediate slide, fast
        opacity: { duration: 0.4, ease: "easeOut", delay: 0.1 },
        filter: { duration: 0.8, ease: "easeOut", delay: 0 } // Longer blur transition
      }
    },
    exit: { 
      y: 30,
      opacity: 0,
      filter: "blur(10px)",
      transition: { 
        duration: 0.5,
        ease: "easeIn",
        y: { duration: 0.3, ease: [0.4, 0, 0.6, 1], delay: 0 }, // Immediate slide down
        opacity: { duration: 0.2, ease: "easeIn", delay: 0.1 },
        filter: { duration: 0.6, ease: "easeIn", delay: 0 } // Longer blur out
      }
    },
  };

  return (
    <>
      {/* Hidden measurement div with all words rendered */}
      <div 
        ref={measureRef} 
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: "hidden" }}
      >
        {words.map((word, i) => (
          <span key={i} className={`font-bold ${className}`}>
            {word}
          </span>
        ))}
      </div>

                    {/* Visible animated word */}
       <motion.span 
         className="relative inline-block py-2"
         style={{ minHeight: "1.5em", overflow: "visible" }}
         animate={{ 
           width,
           transition: { 
             type: "spring",
             stiffness: 150,
             damping: 15,
             mass: 1.2,
           }
         }}
       >
         <AnimatePresence mode="wait" initial={false}>
           <motion.span
             key={currentIndex}
             className={`absolute top-0 left-0 font-bold ${className}`}
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             style={{ 
               whiteSpace: "nowrap",
               lineHeight: "1.5",
               overflow: "visible"
             }}
           >
             {words[currentIndex]}
           </motion.span>
         </AnimatePresence>
       </motion.span>
    </>
  );
} 