/**
 * UserCard Component
 * Displays a user profile card with follow button
 */

import { motion } from 'framer-motion';
import { FollowButton } from './FollowButton';

interface UserProfile {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

interface UserCardProps {
  user: UserProfile;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  showStats?: boolean;
  onClick?: () => void;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function UserCard({
  user,
  isFollowing = false,
  showFollowButton = true,
  showStats = false,
  onClick,
  onFollowChange,
}: UserCardProps) {
  const displayName = user.display_name || user.username || 'Utente';
  const initial = displayName[0].toUpperCase();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gray-800 rounded-xl p-4 border border-gray-700 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {displayName}
          </h3>
          {user.username && user.display_name && (
            <p className="text-gray-400 text-sm">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <FollowButton
            userId={user.user_id}
            isFollowing={isFollowing}
            onFollowChange={onFollowChange}
            variant="small"
          />
        )}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-white font-bold">
              {user.followers_count || 0}
            </div>
            <div className="text-gray-400 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">
              {user.following_count || 0}
            </div>
            <div className="text-gray-400 text-sm">Seguiti</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UserCard;
