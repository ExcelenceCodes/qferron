import { createFileRoute, useParams } from "@tanstack/react-router";
import { FerronChat } from "@/components/ai/ferron-chat";

export const Route = createFileRoute("/dashboard/chat/$threadId")({
  component: ThreadChat,
});

function ThreadChat() {
  const { threadId } = useParams({ from: "/dashboard/chat/$threadId" });
  return <FerronChat key={threadId} threadId={threadId} />;
}
