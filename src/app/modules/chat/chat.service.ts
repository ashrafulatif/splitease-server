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

const getChatResponse = async (message: string, user: IRequestUser) => {
  if (!message) {
    throw new AppError(status.BAD_REQUEST, "Message is required"); 
  }

  try {
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
      ? `User Data Context: \nName: ${userData.name}\nEmail: ${userData.email}\nHouses Created: ${JSON.stringify(userData.housesCreated, null, 2)}\nHouses Joined as Member: ${JSON.stringify(userData.houseMembers, null, 2)}`
      : "No project data available for user.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for SplitEase, a split expense management application. " +
            "You help users understand how to manage houses, expenses, meals, payments, and deposits. " +
            "Keep your answers concise, friendly, and relevant to the app. " +
            "Answer directly based on the provided User Data Context. If the user asks about their own data, use the context below:\n\n" +
            projectContext,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile", 
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
