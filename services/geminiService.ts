import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DetoxResponse } from "../types";

const jsonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Breve frase riassuntiva (es. Trovati 3 documenti, di cui 1 urgente)",
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          type: { type: Type.STRING, description: "Tipo di documento (Bolletta, Lettera, Volantino, Appunto)" },
          sender: { type: Type.STRING, description: "Nome Mittente (es. Enel, Banca, Sconosciuto)" },
          extract_date: { type: Type.STRING, description: "Data rilevata formato YYYY-MM-DD o 'N/A'" },
          deadline: { type: Type.STRING, description: "Data scadenza se presente formato YYYY-MM-DD o 'N/A'" },
          amount: { type: Type.STRING, description: "Importo da pagare se presente (es. €45.00), o null se non applicabile", nullable: true },
          urgency_score: { type: Type.INTEGER, description: "Punteggio urgenza 1-10 (10 = scade domani/oggi, 1 = spazzatura)" },
          category: { type: Type.STRING, enum: ["ACTION", "ARCHIVE", "TRASH"] },
          action_suggested: { type: Type.STRING, description: "Frase breve (es. Paga entro il 15/11)" },
          visibility: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Quanto è leggibile il documento" }
        },
        required: ["id", "type", "sender", "urgency_score", "category", "action_suggested"],
      },
    },
  },
  required: ["summary", "items"],
};

export const analyzeImage = async (base64Image: string): Promise<DetoxResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
Sei "Desk Detox AI", un assistente esecutivo virtuale ultra-efficiente specializzato in gestione documentale e smistamento posta.

IL TUO OBIETTIVO:
Analizzare un'immagine di una scrivania disordinata piena di documenti, buste e fogli. Devi identificare ogni singolo documento visibile, estrarre i dati chiave e decidere l'azione da intraprendere.

ISTRUZIONI DI ANALISI:
1. Scansiona l'immagine per individuare documenti distinti (bollette, lettere, appunti, volantini).
2. Per ogni documento, leggi il testo visibile (mittente, date, importi).
3. Classifica ogni oggetto in una di queste 3 categorie:
   - "ACTION": Richiede un'azione (pagare, chiamare, firmare).
   - "ARCHIVE": Documento importante da conservare ma senza scadenze (contratti, referti medici).
   - "TRASH": Pubblicità, buste vuote, cose inutili.

REGOLE CRITICHE:
- **FORMATO DATA**: Tutte le date (extract_date, deadline) DEVONO essere nel formato ISO standard "YYYY-MM-DD" (es. 2023-11-25). Se la data non è presente, usa "N/A".
- Se una data è ambigua, assumi la più vicina nel futuro.
- Se vedi un logo famoso, usalo per identificare il mittente.
- Se il documento è troppo coperto per essere letto, impostalo come "review_needed" nell'action_suggested.
- Non inventare dati non visibili.
- Restituisci i dati strettamente in italiano (a parte le date che devono essere ISO).
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Analizza questa scrivania e estrai i dati dei documenti.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DetoxResponse;
    } else {
      throw new Error("Nessuna risposta testuale generata dal modello.");
    }
  } catch (error) {
    console.error("Errore durante l'analisi Gemini:", error);
    throw error;
  }
};