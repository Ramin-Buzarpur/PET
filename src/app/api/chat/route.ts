import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatModel, NO_API_KEY_MESSAGE } from "@/lib/ai";
import { retrieveContext, buildSystemPrompt } from "@/lib/rag";
import { buildPetContext } from "@/lib/pet-chat-context";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  petId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "پیام نامعتبر است" }, { status: 400 });
  }

  const { messages, petId } = parsed.data;
  const model = getChatModel();

  if (!model) {
    return Response.json({ error: NO_API_KEY_MESSAGE }, { status: 503 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const context = await retrieveContext(lastUserMessage?.content ?? "");
  let petContext: string | null = null;

  // اطلاعات پت فقط با وجود اجازهٔ ثبت‌شده در سرور ارسال می‌شود؛ اعتماد به کلاینت کافی نیست.
  if (petId && session?.user) {
    const consent = await prisma.chatPetConsent.findUnique({
      where: { userId_petId: { userId: session.user.id, petId } },
    });
    if (consent) {
      petContext = await buildPetContext(petId, session.user.id);
    }
  }

  const system = buildSystemPrompt(context, petContext);

  if (session?.user) {
    const chatSession = await prisma.chatSession.create({
      data: { userId: session.user.id },
    });
    await prisma.chatMessage.createMany({
      data: messages.map((m) => ({
        sessionId: chatSession.id,
        role: m.role === "user" ? "USER" : "ASSISTANT",
        content: m.content,
      })),
    });
  }

  const uiMessages: UIMessage[] = messages.map((m, i) => ({
    id: String(i),
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(uiMessages),
  });

  return result.toTextStreamResponse();
}
