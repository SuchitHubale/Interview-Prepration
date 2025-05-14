'use client';

import { User } from "@/types";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProfileSkillsProps {
  profileData: User;
  isEditing: boolean;
  onSkillsChange: (skills: string[], skillLevels: Record<string, number>) => void;
}

export const ProfileSkills = ({
  profileData,
  isEditing,
  onSkillsChange
}: ProfileSkillsProps) => {
  const handleAddSkill = (newSkill: string) => {
    if (newSkill && !profileData.skills?.includes(newSkill)) {
      const newSkills = [...(profileData.skills || []), newSkill];
      onSkillsChange(newSkills, {
        ...profileData.skillLevels,
        [newSkill]: 50
      });
    } else if (profileData.skills?.includes(newSkill)) {
      toast.error('This skill already exists!');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = profileData.skills?.filter(s => s !== skill) || [];
    const { [skill]: removed, ...newSkillLevels } = profileData.skillLevels || {};
    onSkillsChange(newSkills, newSkillLevels);
  };

  const handleSkillLevelChange = (skill: string, level: number) => {
    onSkillsChange(profileData.skills || [], {
      ...profileData.skillLevels,
      [skill]: level
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Label htmlFor="skills">Skills</Label>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.skills?.map((skill) => (
              <div 
                key={skill}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="skillInput"
              placeholder="Enter a skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget;
                  handleAddSkill(input.value.trim());
                  input.value = '';
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                const input = document.getElementById('skillInput') as HTMLInputElement;
                handleAddSkill(input.value.trim());
                input.value = '';
              }}
            >
              Add Skill
            </Button>
          </div>
          
          <div className="mt-6 space-y-4">
            {profileData.skills?.map((skill) => (
              <div key={skill} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {profileData.skillLevels?.[skill] || 50}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profileData.skillLevels?.[skill] || 50}
                  onChange={(e) => handleSkillLevelChange(skill, parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileData.skills && profileData.skills.length > 0 ? (
          profileData.skills.map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 dark:text-white font-medium">{skill}</span>
                <span className="text-blue-600 dark:text-blue-400">{profileData.skillLevels?.[skill] || 50}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileData.skillLevels?.[skill] || 50}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No skills added yet</p>
        )}
      </div>
    </div>
  );
};