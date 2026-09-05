import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textTranscript, audioBase64, mimeType = "audio/webm", language = "hi" } = body;
    const isHi = language === "hi";

    const transcript = (textTranscript || "").trim();

    // Ensure we have either browser speech-to-text transcript or audio
    if (!transcript && !audioBase64) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No speech text or audio recording received." },
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "AI API Key is missing. Please configure GEMINI_API_KEY in your .env file.",
          },
        },
        { status: 400 }
      );
    }

    // Reference dates for AI context
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split("T")[0];

    // Structured Prompt for AI Model
    const promptText = `You are an expert AI logistics assistant for FarmEx, an Indian agricultural freight platform.
A farmer has spoken via voice to book a truck/tractor to transport agricultural produce to a mandi.
The speech recognition engine extracted this spoken text:
"${transcript}"

Today's date is ${todayISO} and tomorrow is ${tomorrowISO}.
Active Interface Language: ${isHi ? "Hindi" : "English"}.

Analyze the text and return ONLY a valid JSON object matching this exact schema:
{
  "materialName": "${isHi ? "गेहूं" : "Wheat"}", // Crop name in ${isHi ? "pure Hindi (e.g. गेहूं, धान, मक्का, सरसों, आलू, कपास, गन्ना, प्याज)" : "pure English (e.g. Wheat, Paddy, Maize, Mustard, Potato, Cotton, Sugarcane, Onion)"}. Never mix languages.
  "quantityKg": 5000, // Total weight in Kilograms (number). 1 Quintal / क्विंटल / कुंतल = 100 Kg; 1 Ton / टन = 1000 Kg; e.g. 10 quintals -> 1000, 50 quintals -> 5000. In mandi freight, numbers like 10, 20, 50 without unit mean Quintals (multiply by 100).
  "pickupLocation": "${isHi ? "रामपुर" : "Rampur"}", // ONLY the clean Village, Town, or Farm name. Strip conversational words like "कल", "से", "from", "today".
  "destinationLocation": "${isHi ? "लुधियाना मंडी" : "Ludhiana Mandi"}", // ONLY the clean Mandi or City destination name. Strip conversational words like "लेकर", "भेजना है", "जाना है", "to", "तक".
  "distanceKm": 25, // Extracted or logically estimated road distance in KM. Default to 25 if not mentioned.
  "pickupDate": "${tomorrowISO}", // Format: YYYY-MM-DD. If farmer says "kal" / "कल" / "tomorrow", use "${tomorrowISO}". If "aaj" / "आज" / "today", use "${todayISO}".
  "preferredTimeSlot": "08:00 AM", // Preferred time or slot mentioned by farmer (e.g. "08:00 AM", "09:30 AM", "02:00 PM", "11:00 AM", "Morning", "Evening"). Default to "08:00 AM" if not mentioned.
  "labourRequired": true, // true if farmer asks for labour / mazdoor / hamal / loading / unloading help, else false.
  "notes": "Spoken booking" // Brief summary of any specific notes mentioned by the farmer.
}`;

    const contentsParts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

    // Attach audio only if transcript is missing
    if (audioBase64 && !transcript) {
      const cleanBase64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
      contentsParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    contentsParts.push({
      text: promptText,
    });

    const aiModel = process.env.AI_MODEL || "gemini-3.6-flash";
    const aiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

    const aiRes = await fetch(aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: contentsParts,
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `AI model responded with status ${aiRes.status}`;

      return NextResponse.json(
        {
          success: false,
          error: { message: `AI Service Error: ${errorMsg}` },
        },
        { status: aiRes.status >= 400 && aiRes.status < 500 ? 400 : 502 }
      );
    }

    const aiData = await aiRes.json();
    const rawJsonText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "AI did not generate a response from the speech text." },
        },
        { status: 500 }
      );
    }

    const extractedData = JSON.parse(rawJsonText);

    return NextResponse.json({
      success: true,
      data: extractedData,
      source: "ai",
    });
  } catch (error) {
    console.error("[AI_VOICE_EXCEPTION]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to process speech text with AI",
        },
      },
      { status: 500 }
    );
  }
}
