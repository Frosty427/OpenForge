import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const payload = getUserFromRequest(req);
    const userId = payload?.userId;

    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        await prisma.supportTicket.create({
          data: {
            subject,
            message: `From: ${name} <${email}>\n\n${message}`,
            userId: existingUser.id,
          },
        });
      } else {
        const guestUser = await prisma.user.create({
          data: {
            email,
            password: "guest",
            name,
          },
        });

        await prisma.supportTicket.create({
          data: {
            subject,
            message: `From: ${name} <${email}>\n\n${message}`,
            userId: guestUser.id,
          },
        });
      }
    } else {
      await prisma.supportTicket.create({
        data: {
          subject,
          message: `From: ${name} <${email}>\n\n${message}`,
          userId,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Ticket submitted successfully" });
  } catch (error) {
    console.error("Support contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
