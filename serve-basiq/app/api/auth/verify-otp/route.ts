export const runtime = "nodejs"; // ✅ REQUIRED

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        const record = await prisma.otp.findFirst({
            where: {
                phone,
                code: otp,
                purpose: "LOGIN",
                expiresAt: { gt: new Date() },
            },
        });

        if (!record) {
            return NextResponse.json(
                { message: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        const user =
            (await prisma.user.findUnique({ where: { phone } })) ??
            (await prisma.user.create({ data: { phone } }));

        await prisma.otp.deleteMany({ where: { phone } });

        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error("VERIFY OTP ERROR:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
