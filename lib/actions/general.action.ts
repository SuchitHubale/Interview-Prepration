"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please provide a detailed analysis in the following format:

        1. Overall Assessment (0-100):
        - Provide a comprehensive evaluation of the candidate's performance
        - Highlight key strengths and major areas of concern
        - Include specific examples from the interview

        2. Category-wise Analysis (0-100 for each):
        - Communication Skills: Evaluate clarity, articulation, and structured responses
        - Technical Knowledge: Assess understanding of key concepts and depth of knowledge
        - Problem-Solving: Analyze approach to problems and solution quality
        - Cultural & Role Fit: Evaluate alignment with company values and job requirements
        - Confidence & Clarity: Assess confidence level and response clarity

        3. Detailed Feedback:
        - For each category, provide:
          * Specific examples of good responses
          * Examples of responses that needed improvement
          * Concrete suggestions for improvement
          * Best practices and tips for future interviews

        4. Strengths:
        - List specific strengths demonstrated during the interview
        - Include examples of particularly strong responses
        - Highlight unique qualities that stood out

        5. Areas for Improvement:
        - List specific areas that need work
        - Provide detailed suggestions for improvement
        - Include examples of better ways to answer specific questions
        - Add practical tips for preparation

        6. Action Plan:
        - Provide a structured plan for improvement
        - Include specific resources or topics to study
        - Suggest practice exercises or mock interview scenarios
        - Recommend ways to develop identified weaknesses

        Be specific and actionable in your feedback. Instead of general statements like "improve communication", provide concrete examples and specific suggestions like "When explaining technical concepts, start with a high-level overview before diving into details. For example, when discussing system architecture, you could say 'This system follows a microservices architecture, which means...'"

        Format your response as a JSON object with the following structure:
        {
          "totalScore": number,
          "finalAssessment": string,
          "categoryScores": [
            {
              "name": string,
              "score": number,
              "comment": string
            }
          ],
          "strengths": string[],
          "areasForImprovement": string[],
          "actionPlan": string[]
        }
      `,
      system:
        "You are a professional interviewer providing detailed, actionable feedback to help candidates improve their interview performance. Focus on specific examples and concrete suggestions rather than general advice.",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      actionPlan: object.actionPlan,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
