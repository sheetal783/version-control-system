import dotenv from "dotenv";
dotenv.config();

export const generateCommitMessageController = async (req, res) => {
  const { changes } = req.body;

  if (!changes) {
    return res.status(400).json({ error: "No changes provided" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI Service configuration missing (GROQ_API_KEY)" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a Git expert. Generate exactly 5 concise, professional commit messages following Conventional Commits (feat:, fix:, chore:, etc.) for the user's changes.
            Return your response as a JSON object with a single "messages" key.
            The value of "messages" should be a single string containing exactly 5 numbered suggestions in this format:
            1. <message 1>
            2. <message 2>
            3. <message 3>
            4. <message 4>
            5. <message 5>
            
            No intro, no explanation, no markdown.`,
          },
          {
            role: "user",
            content: `Generate 5 commit messages for these changes: ${changes}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 300,
        top_p: 1,
        stream: false,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Groq API Error:", data);
        throw new Error(data.error?.message || "Failed to fetch from AI service");
    }

    const aiResponse = data.choices[0].message.content;
    console.log("Raw AI Response:", aiResponse);
    
    let messages = [];
    try {
        const parsed = JSON.parse(aiResponse);
        const content = parsed.messages || parsed.suggestions || "";
        
        if (typeof content === 'string') {
            // Split by numbered list (1. 2. etc)
            // Regex handles cases where they might be on new lines or separated by numbers
            messages = content.split(/\d+\.\s+/).filter(m => m.trim().length > 0).map(m => m.trim());
        } else if (Array.isArray(content)) {
            messages = content;
        }
    } catch (e) {
        console.error("JSON Parsing Error:", e);
        // Extreme fallback
        messages = aiResponse.split(/\d+\.\s+/).filter(m => m.trim().length > 0).map(m => m.trim());
    }

    // Secondary cleanup: remove any remaining numbers/bullets if the split was messy
    const cleanedMessages = messages
        .map(msg => msg.replace(/^[0-9.-]+\s*/, "").replace(/^"|"$/g, "").trim())
        .filter(msg => (msg.includes(":") || msg.length > 5) && !msg.toLowerCase().includes("copy to clipboard"));

    if (cleanedMessages.length === 0) {
        console.warn("AI returned empty messages or unparseable format.");
    }

    res.json({ messages: cleanedMessages.slice(0, 5) });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate commit messages", details: error.message });
  }
};
