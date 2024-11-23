import { useEffect, useState } from 'react';
import {
  Loader2, RefreshCw, ThumbsUp, Share2, MessageCircle, X, Send,
 MessageSquare, Filter
} from "lucide-react";

function HomePage() {
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedJokes, setLikedJokes] = useState(new Set());
  const [comments, setComments] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const categories = [
    { id: 'clean', label: 'Clean' },
    { id: 'animal', label: 'Animal' },
    { id: 'food', label: 'Food' },
    { id: 'knock-knock', label: 'Knock Knock' },
    { id: 'sport', label: 'Sport' },
    { id: 'nerdy', label: 'Nerdy' },
    { id: 'one-liner', label: 'One Liner' },
    { id: 'holiday', label: 'Holiday' },
    { id: 'kids', label: 'Kids' }
  ];

  useEffect(() => {
    fetchJokes();
    // Load saved data from localStorage
    const savedLikes = localStorage.getItem('likedJokes');
    if (savedLikes) {
      setLikedJokes(new Set(JSON.parse(savedLikes)));
    }
    const savedComments = localStorage.getItem('comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
    const savedCategories = localStorage.getItem('selectedCategories');
    if (savedCategories) {
      setSelectedCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  const fetchJokes = async () => {
    setLoading(true);
    try {
      const categoryParams = selectedCategories.length > 0
        ? selectedCategories.map(cat => `include-tags=${cat}`).join('&')
        : 'include-tags=clean';

      const response = await fetch(
        `https://api.humorapi.com/jokes/search?api-key=0d3082d960454a78b53a489e4d6ca38f&${categoryParams}&number=10`
      );
      const data = await response.json();
      if (data.jokes) {
        setJokes(data.jokes);
        setError(null);
      }
    } catch (err) {
      setError("Failed to load jokes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelectedCategories);
    localStorage.setItem('selectedCategories', JSON.stringify(newSelectedCategories));
  };

  const handleLike = (jokeId) => {
    const newLikedJokes = new Set(likedJokes);
    if (newLikedJokes.has(jokeId)) {
      newLikedJokes.delete(jokeId);
    } else {
      newLikedJokes.add(jokeId);
    }
    setLikedJokes(newLikedJokes);
    localStorage.setItem('likedJokes', JSON.stringify([...newLikedJokes]));
  };

  const handleComment = (jokeId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: new Date().toLocaleString(),
      author: 'User'
    };

    setComments(prev => ({
      ...prev,
      [jokeId]: [...(prev[jokeId] || []), comment]
    }));

    setNewComment('');
    setActiveCommentBox(null);
  };

  const handleShare = async (joke, platform) => {
    const text = encodeURIComponent(joke.joke);
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${text}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${text}`;
        break;
      default:
        await navigator.clipboard.writeText(joke.joke);
        alert('Joke copied to clipboard!');
        setShowShareModal(null);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    setShowShareModal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">
            Life's Little Laughs
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            A collection of {jokes.length} jokes to brighten your day
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={fetchJokes}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Jokes
            </button>
            <button
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Filter className="mr-2 h-4 w-4" />
              Categories ({selectedCategories.length})
            </button>
          </div>

          {/* Category Filter Modal */}
          {showCategoryFilter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Select Categories</h3>
                  <button
                    onClick={() => setShowCategoryFilter(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-lg transition-colors ${selectedCategories.includes(category.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      localStorage.setItem('selectedCategories', '[]');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryFilter(false);
                      fetchJokes();
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-center text-red-600 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid gap-6">
            {jokes.map((joke) => (
              <div key={joke.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
                <p className="text-lg text-gray-800 mb-4">{joke.joke}</p>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(joke.id)}
                    className={`inline-flex items-center space-x-1 ${likedJokes.has(joke.id) ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
                      }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{likedJokes.has(joke.id) ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentBox(activeCommentBox === joke.id ? null : joke.id)}
                    className="inline-flex items-center space-x-1 text-gray-500 hover:text-blue-600"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Comment {comments[joke.id]?.length ? `(${comments[joke.id].length})` : ''}</span>
                  </button>

                  <button
                    onClick={() => setShowShareModal(joke.id)}
                    className="inline-flex items-center space-x-1 text-gray-500 hover:text-green-600"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentBox === joke.id && (
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(joke.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleComment(joke.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    {comments[joke.id]?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {comments[joke.id].map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{comment.author}</span>
                              <span>{comment.timestamp}</span>
                            </div>
                            <p className="mt-1 text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Share Modal */}
                {showShareModal === joke.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Share Joke</h3>
                        <button
                          onClick={() => setShowShareModal(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleShare(joke, 'whatsapp')}
                          className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-green-50 text-green-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare(joke, 'twitter')}
                          className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 text-blue-400"
                        >
                          <Twitter className="h-5 w-5" />
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare(joke, 'facebook')}
                          className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 text-blue-600"
                        >
                          <Facebook className="h-5 w-5" />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare(joke, 'copy')}
                          className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                          <Share2 className="h-5 w-5" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;