import React, { useState, useEffect } from 'react';
import { ThumbsUp, Share2, Copy, Facebook, MessageCircle, Instagram } from "lucide-react";

// eslint-disable-next-line react/prop-types
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
  const gridSize = 5;

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
        
        if (newProgress > 50) {
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
    (scratchProgress / 55) * 100,
    (shakeCount / 5) * 100
  );

  const generateShareMessage = () => {
    const shareUrl = 'https://twisted-tickles.vercel.app';
    
    // Create a more engaging message format
    return `$ JOKE OF THE DAY! \n\n` +
           `${setup}\n\n` +
           `...\n\n` +
           `${punchline}\n\n` +
           `Share the laughter at:\n` +
           `${shareUrl}`;
  };
  
  const handleShare = async (platform) => {
    
    const shareMessage = generateShareMessage();
    
    switch (platform) {
      case 'whatsapp':
        // WhatsApp allows sharing both text and image URL
        const whatsappMessage = `${shareMessage}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        break;
        
      case 'facebook':
        // Use Facebook Share Dialog API for better sharing with image
        FB.ui({
          method: 'share',
          href: 'https://twisted-tickles.vercel.app',
          quote: shareMessage,
          hashtag: '#DailyJoke'
        });
        break;
        
      case 'instagram':

        const instagramMessage = `${shareMessage}\n\n#DailyJoke #Humor #FunnyMoments`;
        window.open(`https://www.instagram.com/direct/inbox/?text=${encodeURIComponent(instagramMessage)}`);
        break;
      case 'twitter':
        const twitterText = shareMessage.substring(0, 280); // Twitter character limit
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(imageUrl)}`,
          '_blank'
        );
        break;
        
      case 'copy':
        // Enhanced clipboard copy with image URL
        const fullMessage = `${shareMessage}\n\nSee joke image: ${imageUrl}`;
        await navigator.clipboard.writeText(fullMessage);
        
        // Show success message with animation
        setCopySuccess(true);
        toast({
          title: "Copied!",
          description: "Joke and image link copied to clipboard",
          duration: 2000
        });
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
    
    // Track sharing analytics
    trackShare(platform);
    
    // Close share menu with animation
    setShowShareMenu(false);
  };
  
  // Helper function to track sharing analytics
  const trackShare = (platform) => {
    try {
      analytics.track('joke_shared', {
        platform,
        jokeType: type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
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
    <div className=" mt-6 w-full max-w-lg mx-auto p-4 flex items-center justify-center ">
      <div className="bg-black border-2 border-yellow-300 rounded-xl shadow-[0_0_20px_rgba(253,224,71,0.3)] p-6 w-full relative">
        {/* Top section with type badge and interaction buttons */}
        <div className="flex justify-between items-start mb-6">
          <span className="px-4 py-1 bg-yellow-300 text-black rounded-full text-sm font-bold animate-pulse">
            {type}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                likedJokes.has(setup)
                  ? 'bg-yellow-300 text-black'
                  : 'bg-black border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full bg-black border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {/* Custom Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-black border-2 border-yellow-300 rounded-lg shadow-[0_0_10px_rgba(253,224,71,0.3)] py-2 z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 flex items-center gap-2 text-yellow-300 hover:bg-yellow-300 hover:text-black transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full px-4 py-2 flex items-center gap-2 text-yellow-300 hover:bg-yellow-300 hover:text-black transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-full px-4 py-2 flex items-center gap-2 text-yellow-300 hover:bg-yellow-300 hover:text-black transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 flex items-center gap-2 text-yellow-300 hover:bg-yellow-300 hover:text-black transition-colors"
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
        <h2 className="text-xl font-bold mb-4 text-yellow-300 text-shadow-neon">{setup}</h2>

        {/* Punchline reveal area */}
        <div 
          className="relative min-h-[150px] bg-black border-2 border-yellow-300 rounded-lg p-4 cursor-pointer touch-none"
          onMouseDown={handleScratchStart}
          onMouseMove={handleScratchMove}
          onMouseUp={handleScratchEnd}
          onMouseLeave={handleScratchEnd}
          onTouchStart={handleScratchStart}
          onTouchMove={handleScratchMove}
          onTouchEnd={handleScratchEnd}
        >
          {isRevealed ? (
            <p className="text-yellow-300 italic">{punchline}</p>
          ) : (
            <div className="absolute inset-0 bg-black border-2 border-yellow-300 rounded-lg flex flex-col items-center justify-center">
              <div className="w-full px-8 mb-4">
                <div className="w-full bg-black border border-yellow-300 rounded-full h-2">
                  <div 
                    className="bg-yellow-300 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                    style={{ width: `${revealProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-yellow-300 text-center px-4 animate-pulse">
                {revealProgress < 30 && "Keep scratching or shaking!"}
                {revealProgress >= 30 && revealProgress < 50 && "Almost there..."}
                {revealProgress >= 50 && "Just a little more!"}
              </p>
            </div>
          )}
        </div>

        {/* Copy success message */}
        {copySuccess && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-black px-4 py-2 rounded-full text-sm font-bold animate-bounce">
            Copied to clipboard!
          </div>
        )}
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className=" mt-4 bg-yellow-400 text-black px-4 py-2 rounded-full shadow-md"
        >
          {isRevealed ? "Hide Punchline" : "Reveal Punchline"}
        </button>
      </div>
      
    </div>
    
  );
};

export default JokeCard;