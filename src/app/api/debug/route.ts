import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        return NextResponse.json({
            status: "ok",
            session,
            envUrl: process.env.NEXTAUTH_URL || "not set",
            vercelUrl: process.env.VERCEL_URL || "not set"
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            error: e.message,
            name: e.name,
            stack: e.stack
        }, { status: 500 });
    }
}
