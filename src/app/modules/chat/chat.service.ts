/* eslint-disable @typescript-eslint/no-explicit-any */
import Groq from "groq-sdk";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const groq = new Groq({
  apiKey: envVars.GROQ_API_KEY,
});

const restrictedQuestionPattern =
  /\b(architecture|architectural|codebase|code|source|implementation|implement|tech(?:nology)?|stack|framework|library|libraries|middleware|rate.?limit|nginx|redis|reverse.?proxy|database|data.?model|schema|prisma|sql|postgres(?:ql)?|mongodb|api|endpoint|route|router|controller|controllers|service|services|repository|repositories|backend|front.?end|server|express|node.?js|groq|openai|llama|model provider|infrastructure|deployment|deploy|docker|container|kubernetes|k8s|cloud|hosting|authentication|authorization|oauth|jwt|session|token|secret|password|credential|encrypt(?:ion)?|security|vulnerabilit(?:y|ies)|exploit|penetration|pentest|hacking|hack|firewall|monitoring|logs?|environment.?variable|git|github|ci.?cd|pipeline|payment provider|stripe)\b/i;

const getRestrictedQuestionResponse = (message: string) => {
  if (!restrictedQuestionPattern.test(message)) {
    return null;
  }

  return "I don't know about that. I can only help with using SplitEase and answering questions about your provided account data.";
};

const getChatResponse = async (message: string, user: IRequestUser) => {
  if (!message) {
    throw new AppError(status.BAD_REQUEST, "Message is required"); 
  }

  try {
    const restrictedQuestionResponse =
      getRestrictedQuestionResponse(message);

    if (restrictedQuestionResponse) {
      return restrictedQuestionResponse;
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        housesCreated: {
          include: {
            members: {
              include: { user: { select: { name: true, email: true } } },
            },
            expenses: { orderBy: { createdAt: "desc" }, take: 5 },
            deposits: { orderBy: { createdAt: "desc" }, take: 5 },
            meals: { orderBy: { date: "desc" }, take: 5 },
          },
        },
        houseMembers: {
          include: {
            house: {
              include: {
                members: {
                  include: { user: { select: { name: true, email: true } } },
                },
                expenses: { orderBy: { createdAt: "desc" }, take: 5 },
                deposits: { orderBy: { createdAt: "desc" }, take: 5 },
                meals: { orderBy: { date: "desc" }, take: 5 },
              },
            },
          },
        },
      },
    });

    const projectContext = userData
      ? `User Data Context:\nName: ${userData.name}\nHouses Created: ${JSON.stringify(
          userData.housesCreated.map((house) => ({
            id: house.id,
            name: house.name,
            description: house.description,
            memberCount: house.members.length,
            expenses: house.expenses,
            deposits: house.deposits,
            meals: house.meals,
          })),
          null,
          2,
        )}\nHouses Joined as Member: ${JSON.stringify(
          userData.houseMembers.map((membership) => ({
            role: membership.role,
            house: {
              id: membership.house.id,
              name: membership.house.name,
              description: membership.house.description,
              memberCount: membership.house.members.length,
              expenses: membership.house.expenses,
              deposits: membership.house.deposits,
              meals: membership.house.meals,
            },
          })),
          null,
          2,
        )}`
      : "No project data available for user.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for SplitEase, a split expense management application. " +
            "You help users understand how to manage houses, expenses, meals, payments, and deposits. " +
            "Keep your answers concise, friendly, and relevant to the app. " +
            "You do not know project code, architecture, implementation, infrastructure, security configuration, or technical internals. " +
            "Never guess or describe typical implementations. " +
            "For any question about these topics, answer exactly: \"I don't know about that. I can only help with using SplitEase and answering questions about your provided account data.\" " +
            "Do not offer follow-up questions, examples, technologies, tools, or code-level recommendations for restricted topics. " +
            "Answer directly based on the provided User Data Context. If the user asks about their own data, use the context below:\n\n" +
            projectContext,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return (
      chatCompletion.choices[0]?.message?.content ||
      "I couldn't generate a response at this time."
    );
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to communicate with AI service",
    );
  }
};

export const ChatService = {
  getChatResponse,
};
