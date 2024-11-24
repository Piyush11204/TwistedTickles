import React, { useState, useEffect } from 'react';
import { ThumbsUp } from "lucide-react";

const JokeCard = ({ joke, likedJokes, setLikedJokes }) => {
  const { setup, punchline, type } = joke;
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Shake detection
  useEffect(() => {
    let shakeThreshold = 15;
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;

    const handleShake = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = new Date().getTime();
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > shakeThreshold) {
          setIsRevealed(true);
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleShake);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleShake);
      }
    };
  }, []);

  const handleLike = () => {
    const newLikedJokes = new Set(likedJokes);
    if (newLikedJokes.has(setup)) {
      newLikedJokes.delete(setup);
    } else {
      newLikedJokes.add(setup);
    }
    setLikedJokes(newLikedJokes);
  };

  // Scratch handling
  const handleScratchStart = (e) => {
    setIsDragging(true);
    handleScratchMove(e);
  };

  const handleScratchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches ? e.touches[0] : e;
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Update scratch progress
    const totalArea = rect.width * rect.height;
    const newProgress = Math.min(scratchProgress + 1000 / totalArea, 100);
    setScratchProgress(newProgress);
    
    if (newProgress > 50) {
      setIsRevealed(true);
    }
  };

  const handleScratchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full">
        <div className="flex justify-between items-start mb-6">
          <span className="px-4 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
            {type}
          </span>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-colors ${
              likedJokes.has(setup)
                ? 'bg-pink-100 text-pink-600'
                : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
            }`}
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">{setup}</h2>

        <div 
          className="relative min-h-[150px] bg-gray-100 rounded-lg p-4 cursor-pointer touch-none"
          onMouseDown={handleScratchStart}
          onMouseMove={handleScratchMove}
          onMouseUp={handleScratchEnd}
          onMouseLeave={handleScratchEnd}
          onTouchStart={handleScratchStart}
          onTouchMove={handleScratchMove}
          onTouchEnd={handleScratchEnd}
        >
          {isRevealed ? (
            <p className="text-gray-600 italic">{punchline}</p>
          ) : (
            <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 text-center px-4">
                Scratch here or shake your device to reveal!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JokeCard;