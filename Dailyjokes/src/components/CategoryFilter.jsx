import React from 'react';

const JokeCard = ({ joke, isRevealed, likedJokes, setLikedJokes }) => {
  const { setup, punchline, type } = joke;

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
    <div className="bg-white rounded-xl shadow-xl p-8">
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

      <div className="relative min-h-[100px] bg-gray-100 rounded-lg p-4 cursor-pointer">
        {isRevealed ? (
          <p className="text-gray-600 italic">{punchline}</p>
        ) : (
          <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Scratch here or shake device!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JokeCard;
