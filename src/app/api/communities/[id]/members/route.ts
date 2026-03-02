import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const communityId = resolvedParams.id;

        const members = await prisma.communityMember.findMany({
            where: { communityId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(members, { status: 200 });

    } catch (error: any) {
        console.error("GET_MEMBERS_ERROR:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
