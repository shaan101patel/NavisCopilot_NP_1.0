import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// IMPLEMENT LATER: Replace with real-time call and transcript data from backend (Supabase).
// Expected data: callId, participant info, transcript (array of utterances), current script, AI suggestions.
const mockTranscript = [
  { speaker: "Agent", text: "Hello, thank you for calling Navis support. How can I help you today?" },
  { speaker: "Customer", text: "Hi, I need help with my order." },
];

const mockAISuggestions = [
  "Ask for the customer's order number.",
  "Offer to check the order status in the system.",
];

export default function Calls() {
  // IMPLEMENT LATER: Fetch live call data, transcript, and AI suggestions for the active call.
  const [transcript] = useState(mockTranscript);
  const [aiSuggestions] = useState(mockAISuggestions);

  return (
    <div>
      <h1 className="text-3xl font-heading mb-6">Live Call Window</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left pane: Real-time transcript and notes */}
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Transcript & Notes</h2>
          <div className="h-64 overflow-y-auto bg-muted rounded p-4">
            {/* IMPLEMENT LATER: Stream real-time transcript data here */}
            {transcript.map((entry, idx) => (
              <div key={idx} className="mb-2">
                <span className="font-bold text-primary">{entry.speaker}:</span>{" "}
                <span>{entry.text}</span>
              </div>
            ))}
          </div>
          {/* IMPLEMENT LATER: Add note-taking functionality (save notes to backend) */}
          <div className="mt-4">
            <input
              className="w-full border border-border rounded px-3 py-2"
              placeholder="Add a note..."
              disabled
            />
            {/* IMPLEMENT LATER: Enable note input and save notes to backend */}
          </div>
        </Card>

        {/* Right pane: RAG-powered AI answers/scripts */}
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">AI Suggestions & Script</h2>
          {/* IMPLEMENT LATER: Display dynamic RAG output based on call context and agent experience level */}
          <ul className="list-disc pl-5 text-gray-700">
            {aiSuggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
          {/* IMPLEMENT LATER: Add controls to switch between "newbie," "intermediate," and "experienced" script modes */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" disabled>
              Newbie
            </Button>
            <Button variant="outline" disabled>
              Intermediate
            </Button>
            <Button variant="outline" disabled>
              Experienced
            </Button>
            {/* IMPLEMENT LATER: Enable buttons and update script output based on selection */}
          </div>
        </Card>
      </div>
    </div>
  );
}
