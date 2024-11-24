import React, { useState, useEffect } from 'react';
import { ThumbsUp, Share2, Copy, Facebook, MessageCircle, Instagram } from "lucide-react";

const JokeCard = ({ joke, likedJokes, setLikedJokes }) => {
  const { setup, punchline, type } = joke;
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Previous shake detection code remains the same
  useEffect(() => {
    let shakeThreshold = 25;
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;
    let shakeCooldown = false;

    const handleShake = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current || shakeCooldown) return;

      const currentTime = new Date().getTime();
      if ((currentTime - lastUpdate) > 250) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > shakeThreshold) {
          setShakeCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
              setIsRevealed(true);
              return 0;
            }
            return newCount;
          });

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

  // Scratch handling remains the same
  const [scratchedAreas, setScratchedAreas] = useState(new Set());
  const gridSize = 10;

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
    
    const cellX = Math.floor((x / rect.width) * gridSize);
    const cellY = Math.floor((y / rect.height) * gridSize);
    const cellKey = `${cellX}-${cellY}`;
    
    if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
      setScratchedAreas(prev => {
        const newAreas = new Set(prev);
        newAreas.add(cellKey);
        
        const newProgress = (newAreas.size / (gridSize * gridSize)) * 100;
        setScratchProgress(newProgress);
        
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

  const revealProgress = Math.max(
    (scratchProgress / 70) * 100,
    (shakeCount / 5) * 100
  );

  const handleShare = async (platform) => {
    const jokeText = `${setup}\n\n${isRevealed ? punchline : "Reveal the punchline yourself at our app!"}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(jokeText)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(jokeText)}`);
        break;
      case 'instagram':
        window.open(`https://www.instagram.com/direct/new/?text=${encodeURIComponent(jokeText)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(jokeText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const handleLike = () => {
    const newLikedJokes = new Set(likedJokes);
    if (newLikedJokes.has(setup)) {
      newLikedJokes.delete(setup);
    } else {
      newLikedJokes.add(setup);
    }
    setLikedJokes(newLikedJokes);
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full relative">
        {/* Top section with type badge and interaction buttons */}
        <div className="flex justify-between items-start mb-6">
          <span className="px-4 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
            {type}
          </span>
          <div className="flex gap-2">
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
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {/* Custom Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy to clipboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Joke setup */}
        <h2 className="text-xl font-semibold mb-4">{setup}</h2>

        {/* Punchline reveal area */}
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

        {/* Copy success message */}
        {copySuccess && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default JokeCard;