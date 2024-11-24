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

  // Initialize jokes and categories
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

  // Filter jokes based on selected category
  const filteredJokes = selectedCategory === 'all'
    ? jokes
    : jokes.filter(joke => joke.type === selectedCategory);

  // Get random joke function
  const getRandomJoke = (jokesList = filteredJokes) => {
    if (jokesList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * jokesList.length);
    setCurrentJoke(jokesList[randomIndex]);
    setIsRevealed(false);
  };



  // Handle drag gesture
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
     />
        <h1 className="text-4xl text-center font-bold text-yellow-400 mb-2 flex items-center justify-center gap-1">
          <Sparkles className="w-8 h-8" />
          Twisted Tickle
          <Sparkles className="w-8 h-8" />
        </h1>
        <p className="text-yellow-200/60 text-center text-lg">Your daily dose of laughter!</p>

      
       

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

        <div className="text-center mt-8 text-yellow-400">
          Swipe to see next joke • Scratch or shake to reveal punchline
        </div>
      </div>
    </div>
  );
};

export default JokesPage;