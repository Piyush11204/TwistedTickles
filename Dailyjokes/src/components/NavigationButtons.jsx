import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationButtons = ({ onPrevious, onNext }) => {
  const x = useMotionValue(0);
  const dragThreshold = 50;

  const handleDragEnd = (event, info) => {
    const dragDistance = info.offset.x;
    if (dragDistance > dragThreshold) {
      onPrevious();
    } else if (dragDistance < -dragThreshold) {
      onNext();
    }
  };

  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.2, 0.5, 1, 0.5, 0.2]
  );

  const scale = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.8, 0.9, 1, 0.9, 0.8]
  );

  return (
    <div className="absolute inset-0">
      <motion.div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ opacity, scale }}
        >
          <button
            onClick={onPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200 transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6 text-violet-700" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200 transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6 text-violet-700" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NavigationButtons;