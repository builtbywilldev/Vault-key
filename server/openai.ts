import OpenAI from "openai";
import { SummarizeResponse } from "@shared/schema";

/**
 * Processes meeting notes using OpenAI's GPT API to extract summary, action items, and questions
 * @param meetingNotes The meeting notes or transcript text
 * @param apiKey The OpenAI API key
 * @returns Summary, action items and questions
 */
export async function summarizeMeetingNotes(
  meetingNotes: string,
  apiKey: string
): Promise<SummarizeResponse> {
  // Initialize OpenAI client with the provided API key
  const openai = new OpenAI({ apiKey });

  try {
    // Create a system prompt that instructs the model how to process the meeting notes
    const systemPrompt = `
      You are an AI assistant specialized in analyzing meeting notes and transcripts.
      Please analyze the provided meeting notes and generate the following:
      
      1. A concise summary (3-5 sentences) that captures the key points of the meeting
      2. A list of action items or tasks mentioned in the meeting
      3. A list of questions raised during the meeting
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "The concise summary of the meeting...",
        "actionItems": ["Action item 1", "Action item 2", ...],
        "questions": ["Question 1?", "Question 2?", ...]
      }
      
      If no action items or questions are found, return an empty array for those fields.
    `;

    // Call the OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: meetingNotes }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response content
    const jsonString = response.choices[0].message.content;
    
    if (!jsonString) {
      throw new Error("Empty response from OpenAI API");
    }

    const result = JSON.parse(jsonString) as SummarizeResponse;
    
    // Ensure the response has all required fields
    return {
      summary: result.summary || "No summary could be generated.",
      actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
      questions: Array.isArray(result.questions) ? result.questions : []
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
