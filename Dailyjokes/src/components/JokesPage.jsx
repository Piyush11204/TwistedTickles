import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Share2, Filter, ThumbsUp } from 'lucide-react';
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

  useEffect(() => {
    const processedJokes = jokesData.map(joke => ({
      setup: joke.setup,
      punchline: joke.punchline,
      type: joke.type || 'general',
    }));
    setJokes(processedJokes);
    const uniqueCategories = new Set(processedJokes.map(joke => joke.type));
    setCategories(['all', ...Array.from(uniqueCategories)]);
    getRandomJoke(processedJokes);
  }, []);

  const getRandomJoke = (jokesList = jokes) => {
    if (jokesList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * jokesList.length);
    setCurrentJoke(jokesList[randomIndex]);
    setIsRevealed(false);
  };

  const handleDragEnd = (event, info) => {
    const DRAG_THRESHOLD = 50;
    if (Math.abs(info.offset.x) > DRAG_THRESHOLD) {
      if (info.offset.x > 0) {
        controls.start({
          x: '100%',
          opacity: 0,
          transition: { duration: 0.2 }
        }).then(() => {
          getRandomJoke();
          controls.set({ x: '-100%' });
          controls.start({ x: 0, opacity: 1 });
        });
      } else {
        controls.start({
          x: '-100%',
          opacity: 0,
          transition: { duration: 0.2 }
        }).then(() => {
          getRandomJoke();
          controls.set({ x: '100%' });
          controls.start({ x: 0, opacity: 1 });
        });
      }
    } else {
      controls.start({ x: 0 });
    }
  };

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
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            Twisted Tickles
            <Sparkles className="w-8 h-8" />
          </h1>
          <p className="text-yellow-200/60 text-lg">Your daily dose of laughter!</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={false}
          animate={showCategoryFilter ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === category 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Joke Card */}
        <div className="relative h-[450px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentJoke && (
              <motion.div
                key={currentJoke.setup}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                className="w-full touch-pan-x"
              >
                <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-400 p-1 rounded-2xl shadow-lg">
                  <div className="bg-black rounded-xl p-6 min-h-[300px] flex flex-col justify-between">
                    <div className="space-y-6">
                      <p className="text-yellow-400 text-xl font-medium">{currentJoke.setup}</p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isRevealed ? 1 : 0 }}
                        className="text-yellow-200 text-lg"
                      >
                        {isRevealed ? currentJoke.punchline : '***************'}
                      </motion.p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-yellow-400/60 text-sm">
                        {currentJoke.type.charAt(0).toUpperCase() + currentJoke.type.slice(1)}
                      </span>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setLikedJokes(prev => 
                            new Set([...prev, currentJoke.setup])
                          )}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Categories
          </button>
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="px-6 py-3 bg-yellow-400 text-black rounded-full font-medium hover:bg-yellow-300 transition-colors"
          >
            {isRevealed ? 'Hide Punchline' : 'Reveal Punchline'}
          </button>
        </div>

        <div className="text-center mt-8 text-yellow-400/60">
          Swipe left or right for next joke
        </div>
      </div>
    </div>
  );
};

export default JokesPage;