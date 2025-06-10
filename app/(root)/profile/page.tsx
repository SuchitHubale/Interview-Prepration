'use client';

import React, { useEffect, useState } from 'react'
import { User } from "@/types";
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { getCurrentUser, signOut } from '@/lib/actions/auth.action';
import { auth, db } from '@/firebase/client'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import Loading from '@/components/loading';

const ProfilePage = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<User>({
    id: "",
    name: "",
    email: "",
    bio: "",
    location: "",
    skills: [],
    skillLevels: {},
    profileImage: "/avatar/img1.jpeg", // Default avatar
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          setProfileData({ id: user.id, ...userDoc.data() } as User);
        } else {
          toast.error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAvatarChange = async (avatar: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      setProfileData(prev => ({ ...prev, profileImage: avatar }));
      await updateDoc(doc(db, "users", user.uid), {
        profileImage: avatar,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleProfileChange = (updates: Partial<User>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const handleSkillsChange = (skills: string[], skillLevels: Record<string, number>) => {
    setProfileData(prev => ({ ...prev, skills, skillLevels }));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        ...profileData,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/sign-in');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b tansperent py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-95 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500 before:rounded-2xl before:-z-10 before:animate-gradient-xy">
          <ProfileHeader
            profileData={profileData}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onLogout={handleLogout}
            onAvatarChange={handleAvatarChange}
          />

          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h1 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {profileData.name}
                </motion.h1>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {profileData.email}
                </motion.p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <ProfileAbout
                profileData={profileData}
                isEditing={isEditing}
                onProfileChange={handleProfileChange}
              />

              <ProfileSkills
                profileData={profileData}
                isEditing={isEditing}
                onSkillsChange={handleSkillsChange}
              />

              {isEditing && (
                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage;
