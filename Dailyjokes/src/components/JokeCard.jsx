import React, { useState, useEffect } from 'react';
import { ThumbsUp } from "lucide-react";

const JokeCard = ({ joke, likedJokes, setLikedJokes }) => {
  const { setup, punchline, type } = joke;
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  
  // Shake detection with counter
  useEffect(() => {
    let shakeThreshold = 25; // Increased threshold
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;
    let shakeCooldown = false;

    const handleShake = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current || shakeCooldown) return;

      const currentTime = new Date().getTime();
      if ((currentTime - lastUpdate) > 250) { // Increased time between checks
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > shakeThreshold) {
          setShakeCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) { // Require 5 good shakes
              setIsRevealed(true);
              return 0;
            }
            return newCount;
          });

          // Add cooldown to prevent rapid counting
          shakeCooldown = true;
          setTimeout(() => {
            shakeCooldown = false;
          }, 500);
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

  // Enhanced scratch handling
  const [scratchedAreas, setScratchedAreas] = useState(new Set());
  const gridSize = 10; // 10x10 grid for tracking scratched areas

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
    
    // Convert position to grid cell
    const cellX = Math.floor((x / rect.width) * gridSize);
    const cellY = Math.floor((y / rect.height) * gridSize);
    const cellKey = `${cellX}-${cellY}`;
    
    // Update scratched areas
    if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
      setScratchedAreas(prev => {
        const newAreas = new Set(prev);
        newAreas.add(cellKey);
        
        // Calculate progress based on unique areas scratched
        const newProgress = (newAreas.size / (gridSize * gridSize)) * 100;
        setScratchProgress(newProgress);
        
        // Reveal when 70% of the area has been scratched
        if (newProgress > 70) {
          setIsRevealed(true);
        }
        
        return newAreas;
      });
    }
  };

  const handleScratchEnd = () => {
    setIsDragging(false);
  };

  // Calculate reveal progress for visual feedback
  const revealProgress = Math.max(
    (scratchProgress / 70) * 100, // Scratch progress
    (shakeCount / 5) * 100 // Shake progress
  );

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
            <div className="absolute inset-0 bg-gray-300 rounded-lg flex flex-col items-center justify-center">
              <div className="w-full px-8 mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${revealProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-600 text-center px-4">
                {revealProgress < 30 && "Keep scratching or shaking!"}
                {revealProgress >= 30 && revealProgress < 70 && "Almost there..."}
                {revealProgress >= 70 && "Just a little more!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JokeCard;