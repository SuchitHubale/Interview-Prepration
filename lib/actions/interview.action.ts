import { db } from '@/firebase/client';
import { collection, addDoc } from 'firebase/firestore';

interface InterviewData {
  userId: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  education: string;
  questions: any[];
}

export const createInterview = async (data: InterviewData) => {
  try {
    const interviewRef = await addDoc(collection(db, 'interviews'), {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'created'
    });

    return {
      id: interviewRef.id,
      ...data
    };
  } catch (error) {
    console.error('Error creating interview:', error);
    throw new Error('Failed to create interview');
  }
}; 