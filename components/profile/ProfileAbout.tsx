import { User } from "@/types";
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileAboutProps {
  profileData: User;
  isEditing: boolean;
  onProfileChange: (updates: Partial<User>) => void;
}

export const ProfileAbout = ({
  profileData,
  isEditing,
  onProfileChange
}: ProfileAboutProps) => {
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Input
            id="bio"
            value={profileData.bio ?? ""}
            onChange={(e) => onProfileChange({ bio: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={profileData.location ?? ""}
            onChange={(e) => onProfileChange({ location: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
          >
            About
          </motion.span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {profileData.bio || 'No bio added yet'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
          >
            Location
          </motion.span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {profileData.location || 'No location added yet'}
        </p>
      </motion.div>
    </div>
  );
}; 