import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationButtons = ({ onPrevious, onNext }) => {
  return (
    <>
      <button
        onClick={onPrevious}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200"
      >
        <ChevronLeft className="h-6 w-6 text-violet-700" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200"
      >
        <ChevronRight className="h-6 w-6 text-violet-700" />
      </button>
    </>
  );
};

export default NavigationButtons;
