import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FerronChat } from "@/components/ai/ferron-chat";

export const Route = createFileRoute("/dashboard/chat/")({
  component: NewChat,
});

function NewChat() {
  const navigate = useNavigate();
  return (
    <FerronChat
      onThreadCreated={(id) =>
        void navigate({ to: "/dashboard/chat/$threadId", params: { threadId: id }, replace: true })
      }
    />
  );
}
