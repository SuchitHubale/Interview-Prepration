'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const avatars = [
  '/avatar/img1.jpeg',
  '/avatar/img2.jpeg',
  '/avatar/img3.jpeg',
  '/avatar/img4.jpeg',
  '/avatar/img5.jpeg',
  '/avatar/img6.jpeg',
  '/avatar/img7.jpeg',
];

interface AvatarSelectionProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export const AvatarSelection = ({ selectedAvatar, onSelect }: AvatarSelectionProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <motion.div
          key={avatar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`cursor-pointer rounded-full overflow-hidden border-2 ${
            selectedAvatar === avatar 
              ? 'border-blue-500 ring-2 ring-blue-500/50' 
              : 'border-transparent hover:border-blue-300'
          }`}
          onClick={() => onSelect(avatar)}
        >
          <Image
            src={avatar}
            alt="Avatar option"
            width={80}
            height={80}
            className="rounded-full object-cover aspect-square"
          />
        </motion.div>
      ))}
    </div>
  );
};
