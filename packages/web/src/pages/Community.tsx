/**
 * Community Page
 * Social feed with posts from the community
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedList, UserSearch } from '../components/social';

type FeedTab = 'discover' | 'following';

export function Community() {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Community</h1>

          {/* Search */}
          <UserSearch
            onUserSelect={(userId) => {
              // Navigate to user profile
              console.log('Selected user:', userId);
            }}
            placeholder="Cerca atleti..."
          />

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Scopri
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'following'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Seguiti
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'discover' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'discover' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            <FeedList followingOnly={activeTab === 'following'} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Community;
