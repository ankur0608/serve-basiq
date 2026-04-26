// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if your prisma client is elsewhere

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, category, message, userId } = body;

        // Basic validation
        if (!name || !email || !category || !message) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Save to database
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                category,
                message,
                userId: userId || null, // Associates with user if ID is provided
            }
        });

        return NextResponse.json({ success: true, contactMessage });

    } catch (error: any) {
        console.error("Contact API Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}