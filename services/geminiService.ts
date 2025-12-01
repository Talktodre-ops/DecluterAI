import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export class OrganizationService {
  private chatSession: Chat | null = null;
  private modelId = 'gemini-3-pro-preview';

  constructor() {
    // Initialize chat session lazily or on demand
  }

  // Start a new session or reset
  public startNewSession() {
    this.chatSession = ai.chats.create({
      model: this.modelId,
      config: {
        systemInstruction: `You are DeclutterAI, a warm, professional, and highly practical home organization expert. 
        Your goal is to help users organize their spaces based on photos they upload.
        
        When a user uploads a photo:
        1. Analyze the room's current state (clutter level, style, potential storage usage).
        2. Provide 3-5 specific, actionable steps to improve the space immediately.
        3. Suggest storage solutions or layout changes if applicable.
        
        Keep your tone encouraging and non-judgmental. 
        Format your responses with clear headings or bullet points using Markdown.`,
      },
    });
  }

  public async sendMessage(text: string, imageBase64?: string): Promise<string> {
    if (!this.chatSession) {
      this.startNewSession();
    }

    try {
      if (!this.chatSession) throw new Error("Chat session not initialized");

      let response;
      
      if (imageBase64) {
        // Multi-modal message
        response = await this.chatSession.sendMessage({
          message: {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg', // We'll assume JPEG for simplicity or detect
                    data: imageBase64
                  }
                },
                { text: text }
              ]
            }
          }
        });
      } else {
        // Text-only message
        response = await this.chatSession.sendMessage({
          message: text
        });
      }

      const responseText = response.text;
      if (!responseText) throw new Error("No response from AI");
      return responseText;

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();