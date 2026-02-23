import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Helix, a helpful task management assistant. Your job is to help users create tasks in their life domains (called "verticals").

You will receive the user's current verticals and blocks as context. Use this to guide the conversation.

When a user wants to add a task, you MUST collect ALL of these before calling the tool:
1. Which vertical (life domain) — suggest from existing ones or offer to create a new one
2. Which block within that vertical — suggest from existing ones or offer to create a new one
3. The task title
4. The deadline (optional but ask about it)

Be conversational, concise, and friendly. Use short responses. If the user gives you all the info at once, go ahead and create the task immediately.

When you have all the required information, call the create_task tool. For new verticals or blocks, call create_vertical or create_block first.

IMPORTANT: Always use the exact IDs from the context when referencing existing verticals and blocks. When creating new ones, use descriptive names the user provides.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextMessage = context ? `\n\nUser's current data:\n${JSON.stringify(context, null, 2)}` : "";

    const tools = [
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Create a new task in an existing block",
          parameters: {
            type: "object",
            properties: {
              block_id: { type: "string", description: "The UUID of the block to add the task to" },
              title: { type: "string", description: "The task title" },
              due_date: { type: "string", description: "ISO 8601 date string for the deadline, e.g. 2025-03-01T08:00:00.000Z. Optional." },
            },
            required: ["block_id", "title"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_block",
          description: "Create a new block in an existing vertical",
          parameters: {
            type: "object",
            properties: {
              vertical_id: { type: "string", description: "The UUID of the vertical" },
              name: { type: "string", description: "Name for the new block" },
            },
            required: ["vertical_id", "name"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_vertical",
          description: "Create a new vertical (life domain)",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name for the new vertical" },
              color: { type: "string", description: "Hex color for the vertical, e.g. #4ade80" },
            },
            required: ["name"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("task-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
