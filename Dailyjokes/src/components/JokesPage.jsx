import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Smartphone } from 'lucide-react';
import jokesData from './Jokes.json';
import CategoryFilter from './CategoryFilter.jsx';
import JokeCard from './JokeCard.jsx';
import NavigationButtons from './NavigationButtons.jsx';

const JokesPage = () => {
  const [jokes, setJokes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [likedJokes, setLikedJokes] = useState(new Set());
  const [isRevealed, setIsRevealed] = useState(false);

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

  const filteredJokes = selectedCategory === 'all'
    ? jokes
    : jokes.filter(joke => joke.type === selectedCategory);

  const handleNext = () => {
    setDragDirection('left');
    setCurrentIndex(prevIndex => 
      prevIndex + 1 >= filteredJokes.length ? 0 : prevIndex + 1
    );
    setIsRevealed(false);
  };

  const handlePrevious = () => {
    setDragDirection('right');
    setCurrentIndex(prevIndex => 
      prevIndex - 1 < 0 ? filteredJokes.length - 1 : prevIndex - 1
    );
    setIsRevealed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-violet-800 mb-4">Joke Cards</h1>
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
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            setShowCategoryFilter={setShowCategoryFilter} 
          />
        )}

        <div className="relative h-[400px] flex items-center justify-center">
          <NavigationButtons
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <AnimatePresence mode="wait" custom={dragDirection}>
            {filteredJokes.length > 0 && (
              <motion.div
                key={currentIndex}
                custom={dragDirection}
                variants={{
                  enter: (direction) => ({ x: direction === 'right' ? -1000 : 1000, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction) => ({ x: direction === 'right' ? 1000 : -1000, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <JokeCard 
                  joke={filteredJokes[currentIndex]} 
                  isRevealed={isRevealed} 
                  likedJokes={likedJokes} 
                  setLikedJokes={setLikedJokes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-8 text-gray-600">
          Swipe or use arrows to navigate • Scratch or shake to reveal punchline
        </div>
      </div>
    </div>
  );
};

export default JokesPage;
