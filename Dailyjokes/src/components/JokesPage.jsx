import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  ThumbsUp,
  Smartphone
} from 'lucide-react';
import jokesData from './Jokes.json';

const JokesPage = () => {
  const [jokes, setJokes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [likedJokes, setLikedJokes] = useState(new Set());
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratchStarted, setIsScratchStarted] = useState(false);
  const [scratchPosition, setScratchPosition] = useState({ x: 0, y: 0 });
  const [scratchPercentage, setScratchPercentage] = useState(0);

  useEffect(() => {
    const processedJokes = jokesData.map(joke => ({
      setup: joke.setup,
      punchline: joke.punchline,
      type: joke.type || 'general',
    }));

    setJokes(processedJokes);
    const uniqueCategories = new Set(processedJokes.map(joke => joke.type));
    setCategories(['all', ...Array.from(uniqueCategories)]);
  }, []);

 
  // Shake detection
  useEffect(() => {
    let shakeTimeout;
    const handleShake = (event) => {
      if (event.acceleration.x > 15 || event.acceleration.y > 15) {
        clearTimeout(shakeTimeout);
        shakeTimeout = setTimeout(() => {
          setIsRevealed(true);
        }, 500);
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleShake);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleShake);
      }
      clearTimeout(shakeTimeout);
    };
  }, [currentIndex]);

  const filteredJokes = selectedCategory === 'all'
    ? jokes
    : jokes.filter(joke => joke.type === selectedCategory);

  const handleDragEnd = (e, info) => {
    const swipeThreshold = 50;
    const swipe = info.offset.x;

    if (Math.abs(swipe) > swipeThreshold) {
      if (swipe > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    setDragDirection('left');
    setCurrentIndex(prevIndex => 
      prevIndex + 1 >= filteredJokes.length ? 0 : prevIndex + 1
    );
    setIsRevealed(false);
    setScratchPercentage(0);
    setIsScratchStarted(false);
  };

  const handlePrevious = () => {
    setDragDirection('right');
    setCurrentIndex(prevIndex => 
      prevIndex - 1 < 0 ? filteredJokes.length - 1 : prevIndex - 1
    );
    setIsRevealed(false);
    setScratchPercentage(0);
    setIsScratchStarted(false);
  };

  const handleScratch = useCallback((e) => {
    if (!isScratchStarted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setScratchPosition({ x, y });
    
    // Calculate scratch percentage
    const totalArea = rect.width * rect.height;
    const scratchedArea = Math.min(scratchPercentage + 5, 100);
    setScratchPercentage(scratchedArea);
    
    if (scratchedArea >= 50) {
      setIsRevealed(true);
    }
  }, [isScratchStarted, scratchPercentage]);

  const cardVariants = {
    enter: (direction) => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-violet-800 mb-4">
            Joke Cards
          </h1>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowCategoryFilter(true)}
              className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              <Filter className="mr-2 h-4 w-4" />
              Categories
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              onClick={() => setIsRevealed(true)}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Show Punchline
            </button>
          </div>
        </div>

        {showCategoryFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Category</h3>
                <button
                  onClick={() => setShowCategoryFilter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentIndex(0);
                      setShowCategoryFilter(false);
                    }}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative h-[400px] flex items-center justify-center">
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-violet-600" />
          </button>

          <AnimatePresence mode="wait" custom={dragDirection}>
            {filteredJokes.length > 0 && (
              <motion.div
                key={currentIndex}
                custom={dragDirection}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute w-full max-w-xl"
              >
                <div className="bg-white rounded-xl shadow-xl p-8">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
                      {filteredJokes[currentIndex]?.type}
                    </span>
                    <button
                      onClick={() => {
                        const newLikedJokes = new Set(likedJokes);
                        if (newLikedJokes.has(filteredJokes[currentIndex].setup)) {
                          newLikedJokes.delete(filteredJokes[currentIndex].setup);
                        } else {
                          newLikedJokes.add(filteredJokes[currentIndex].setup);
                        }
                        setLikedJokes(newLikedJokes);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        likedJokes.has(filteredJokes[currentIndex].setup)
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                      }`}
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">
                    {filteredJokes[currentIndex]?.setup}
                  </h2>

                  <div 
                    className="relative min-h-[100px] bg-gray-100 rounded-lg p-4 cursor-pointer"
                    onMouseDown={() => setIsScratchStarted(true)}
                    onMouseUp={() => setIsScratchStarted(false)}
                    onMouseMove={handleScratch}
                    onMouseLeave={() => setIsScratchStarted(false)}
                    onTouchStart={() => setIsScratchStarted(true)}
                    onTouchEnd={() => setIsScratchStarted(false)}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      handleScratch({
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        currentTarget: e.currentTarget
                      });
                    }}
                  >
                    {isRevealed ? (
                      <p className="text-gray-600 italic">
                        {filteredJokes[currentIndex]?.punchline}
                      </p>
                    ) : (
                      <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600">Scratch here or shake device!</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    {currentIndex + 1} / {filteredJokes.length}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleNext}
            className="absolute right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <ChevronRight className="h-6 w-6 text-violet-600" />
          </button>
        </div>

        <div className="text-center mt-8 text-gray-600">
          Swipe or use arrows to navigate • Scratch or shake to reveal punchline
        </div>
      </div>
    </div>
  );
};

export default JokesPage;