
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, TargetWord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSpeech(
  audioBase64: string,
  target: TargetWord
): Promise<DiagnosisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "audio/wav",
              data: audioBase64,
            },
          },
          {
            text: `
              You are an expert AI Speech-Language Pathologist (SLP) specializing in Arabic phonetics and articulation disorders in children.
              Analyze the pronunciation of the child for the target word: "${target.word}"
              specifically focusing on the target phoneme: "${target.phoneme}" at the position: "${target.position}".

              ARABIC PHONETIC EXPERTISE (CRITICAL):
              - /ع/ (Ayn): Pharyngeal voiced sound. It is NOT /أ/ (Hamza). Children often substitute it with /أ/ or omit it entirely.
              - /ح/ (Haa): Pharyngeal voiceless fricative. It is NOT /هـ/ (Haa). Children often substitute it with /هـ/ or /خ/.
              - /خ/ (Khaa): Velar/Post-velar voiceless fricative.
              - /غ/ (Ghayn): Velar/Post-velar voiced fricative.
              - /ص/ (Sad): Emphatic /s/. Children often de-emphasize it into /س/.
              - /ق/ (Qaf): Uvular stop. Often replaced with /ك/ or /أ/.
              - /ر/ (Ra): Alveolar tap/trill. Often replaced with /ل/ or /و/.

              DIAGNOSTIC GUIDELINES:
              1. If you hear the correct target sound for the phoneme "${target.phoneme}", set isCorrect = true and errorType = "none".
              2. If the sound is replaced by another (e.g., /ع/ became /أ/), set isCorrect = false and errorType = "substitution". 
                 Provide details in Arabic: "أبدلت حرف الـ... بحرف الـ...".
              3. If the sound is missing or the syllable is skipped, set isCorrect = false and errorType = "omission".
                 Provide details in Arabic: "حذفت حرف الـ...".

              RESPONSE FORMAT (JSON):
              - isCorrect: boolean
              - transcribed: Arabic script transcription of what the child said.
              - errorType: "substitution" | "omission" | "none"
              - substitutionDetails: (Arabic) explanation if substitution occurred.
              - omissionDetails: (Arabic) explanation if omission occurred.
              - comment: A very short encouraging Arabic sentence for the child.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            transcribed: { type: Type.STRING },
            errorType: { 
              type: Type.STRING, 
              enum: ['substitution', 'omission', 'none']
            },
            substitutionDetails: { type: Type.STRING },
            omissionDetails: { type: Type.STRING },
            comment: { type: Type.STRING },
          },
          required: ['isCorrect', 'transcribed', 'errorType', 'comment'],
        },
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    return {
      wordId: target.id,
      word: target.word,
      phoneme: target.phoneme,
      position: target.position,
      pointsEarned: 0, 
      ...result,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      wordId: target.id,
      word: target.word,
      phoneme: target.phoneme,
      position: target.position,
      isCorrect: false,
      transcribed: "خطأ في الاتصال",
      errorType: "none",
      comment: "نواجه مشكلة بسيطة، حاول مرة أخرى يا بطل!",
      pointsEarned: 0,
    };
  }
}
