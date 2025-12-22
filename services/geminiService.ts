
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
              Analyze the pronunciation of the Arabic word "${target.word}" in the provided audio.
              The targeted phoneme is "${target.phoneme}" which is located at the ${target.position} of the word.

              Diagnostic Rules:
              1. **Correct**: The word and the target phoneme are pronounced clearly and correctly.
              2. **Substitution (إبدال)**: The child replaces the target phoneme with another sound. 
                 Example: Saying "تلب" (Talb) instead of "كلب" (Kalb) -> Substitution of /ك/ with /ت/.
              3. **Omission (حذف)**: The child omits the phoneme or an entire syllable containing it.
                 Example: Saying "مان" (Man) instead of "رمان" (Ruman) -> Omission of the first syllable/phoneme /ر/.
              4. **Distortion (تشويه)**: The sound is produced in a non-standard way but is not a clear substitution.

              Please transcribe what you heard and determine if it's correct. If incorrect, specify the error type and details in Arabic.
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
              enum: ['substitution', 'omission', 'distortion', 'none'] 
            },
            substitutionDetails: { 
              type: Type.STRING,
              description: "Detailed description of the error in Arabic. Example: 'حذف المقطع الأول من الكلمة' or 'إبدال صوت الكاف بالتاء'."
            },
            comment: { type: Type.STRING },
          },
          required: ['isCorrect', 'transcribed', 'errorType'],
        },
      },
    });

    const result = JSON.parse(response.text);
    // Added pointsEarned: 0 to satisfy DiagnosisResult type; App.tsx overrides this with actual points.
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
    // Added pointsEarned: 0 to fix the missing property error in DiagnosisResult.
    return {
      wordId: target.id,
      word: target.word,
      phoneme: target.phoneme,
      position: target.position,
      isCorrect: false,
      transcribed: "خطأ في المعالجة",
      errorType: "none",
      comment: "تعذر الاتصال بالذكاء الاصطناعي حالياً",
      pointsEarned: 0,
    };
  }
}
