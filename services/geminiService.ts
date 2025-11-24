import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestionResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTreeFromText = async (description: string): Promise<AISuggestionResponse> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }

  const systemInstruction = `
    You are a professional genealogist and data architect.
    Your task is to parse a natural language description of a family and extract a graph structure.
    Return a list of nodes (people) and edges (relationships).
    Assume strictly Parent->Child relationships for edges unless specified otherwise.
    For IDs, use simple unique strings like "p1", "p2".
    Infer gender if obvious from context (e.g., "son" = MALE, "daughter" = FEMALE, "mother" = FEMALE). Default to OTHER.
    Format dates as YYYY-MM-DD if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: description,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  gender: { type: Type.STRING, enum: ["MALE", "FEMALE", "OTHER"] },
                  birthDate: { type: Type.STRING },
                  bio: { type: Type.STRING }
                },
                required: ["id", "label"]
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["source", "target"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AISuggestionResponse;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
