'use client';

import { User } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AvatarSelection } from '@/components/ui/AvatarSelection';
import { Userui } from '@/components/ui/Userui';
import { useState } from 'react';

interface ProfileHeaderProps {
  profileData: User;
  isEditing: boolean;
  onEditToggle: () => void;
  onLogout: () => void;
  onAvatarChange: (avatar: string) => void;
}

export const ProfileHeader = ({
  profileData,
  isEditing,
  onEditToggle,
  onLogout,
  onAvatarChange,
}: ProfileHeaderProps) => {
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);

  return (
    <div className="relative h-48">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy" />
      <div className="absolute inset-0.5 bg-gradient-to-r dark:bg-gray-950 rounded-2xl shadow-lg animate-gradient-xy">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>
      
      <div className="absolute -bottom-16 left-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden group"
        >
          {profileData.profileImage ? (
            <Image
              src={profileData.profileImage}
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full object-cover transform transition-transform group-hover:scale-110"
            />
          ) : (
            <Userui className="h-16 w-16 text-gray-400" />
          )}
          {isEditing && (
            <button
              onClick={() => setShowAvatarSelection(!showAvatarSelection)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-white text-sm">Change Avatar</span>
            </button>
          )}
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onEditToggle}
            variant={isEditing ? "destructive" : "default"}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onLogout}
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-shadow bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
          >
            Logout
          </Button>
        </motion.div>
      </div>

      {showAvatarSelection && isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-8 top-full mt-20 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-10"
        >
          <AvatarSelection
            selectedAvatar={profileData.profileImage || ''}
            onSelect={(avatar) => {
              onAvatarChange(avatar);
              setShowAvatarSelection(false);
            }}
          />
        </motion.div>
      )}
    </div>
  );
};