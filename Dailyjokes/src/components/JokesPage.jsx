import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Share2, Filter, ThumbsUp, X } from 'lucide-react';
import jokesData from './Jokes.json';
import JokeCard from './JokeCard.jsx';

const JokesPage = () => {
  const [jokes, setJokes] = useState([]);
  const [currentJoke, setCurrentJoke] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [likedJokes, setLikedJokes] = useState(new Set());
  const [isRevealed, setIsRevealed] = useState(false);
  const controls = useAnimation();

  // Initialize jokes and categories
  useEffect(() => {
    try {
      // Ensure jokes are properly processed and have types
      const processedJokes = jokesData.map(joke => ({
        ...joke,
        type: joke.type?.toLowerCase() || 'general'
      }));

      setJokes(processedJokes);

      // Extract unique categories and sort them
      const uniqueCategories = [...new Set(processedJokes.map(joke => joke.type))].sort();
      setCategories(['all', ...uniqueCategories]);

      // Get initial random joke
      getRandomJoke(processedJokes);
    } catch (error) {
      console.error('Error initializing jokes:', error);
    }
  }, []);

  // Get filtered jokes based on selected category
  const getFilteredJokes = (category = selectedCategory) => {
    return category === 'all'
      ? jokes
      : jokes.filter(joke => joke.type === category);
  };

  // Get random joke function
  const getRandomJoke = (jokesList = null) => {
    const jokesToUse = jokesList || getFilteredJokes();
    
    if (jokesToUse.length === 0) {
      console.warn('No jokes available for the selected category');
      return;
    }

    const currentIndex = currentJoke 
      ? jokesToUse.findIndex(joke => joke.setup === currentJoke.setup)
      : -1;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * jokesToUse.length);
    } while (jokesToUse.length > 1 && randomIndex === currentIndex);

    setCurrentJoke(jokesToUse[randomIndex]);
    setIsRevealed(false);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
    
    // Get a random joke from the new category
    const filteredJokes = getFilteredJokes(category);
    if (filteredJokes.length > 0) {
      getRandomJoke(filteredJokes);
    } else {
      console.warn(`No jokes found for category: ${category}`);
    }
  };

  // Handle drag gesture
  const handleDragEnd = (event, info) => {
    const DRAG_THRESHOLD = 50;
    if (Math.abs(info.offset.x) > DRAG_THRESHOLD) {
      const direction = info.offset.x > 0 ? '100%' : '-100%';
      
      controls.start({
        x: direction,
        opacity: 0,
        transition: { duration: 0.2 }
      }).then(() => {
        getRandomJoke();
        controls.set({ x: direction === '100%' ? '-100%' : '100%' });
        controls.start({ x: 0, opacity: 1 });
      });
    } else {
      controls.start({ x: 0 });
    }
  };

  // Get the current filtered jokes count
  const filteredJokesCount = getFilteredJokes().length;

  return (
    <div className="min-h-screen bg-black">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl text-center font-bold text-yellow-400 mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-8 h-8" />
            Twisted Tickle
            <Sparkles className="w-8 h-8" />
          </h1>
          <p className="text-yellow-200/60 text-center text-lg">Your daily dose of laughter!</p>
        </motion.div>

        {/* Category Filter Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-black border-2 border-yellow-300 text-yellow-300 rounded-full hover:bg-yellow-300 hover:text-black transition-all duration-300"
          >
            <Filter className="w-4 h-4" />
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </button>
        </div>

        {/* Category Filter Modal */}
        <AnimatePresence>
          {showCategoryFilter && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCategoryFilter(false)} />
              <div className="relative bg-black border-2 border-yellow-300 rounded-xl shadow-[0_0_20px_rgba(253,224,71,0.3)] p-4 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-yellow-300 font-bold">Select Category</h3>
                  <button
                    onClick={() => setShowCategoryFilter(false)}
                    className="text-yellow-300 hover:text-yellow-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-yellow-300 text-black'
                          : 'bg-black border border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Joke Card with Drag */}
        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentJoke && (
              <motion.div
                key={currentJoke.setup}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full touch-pan-x"
              >
                <JokeCard
                  joke={currentJoke}
                  isRevealed={isRevealed}
                  likedJokes={likedJokes}
                  setLikedJokes={setLikedJokes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 text-yellow-400">
          Swipe to see next joke • Scratch or shake to reveal punchline
        </div>

        {/* Category Stats */}
        <div className="mt-8 text-center">
          <p className="text-yellow-200/60">
            {filteredJokesCount} jokes in {selectedCategory === 'all' ? 'all categories' : selectedCategory}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JokesPage;