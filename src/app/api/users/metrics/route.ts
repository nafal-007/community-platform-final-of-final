import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ communitiesCount: 0, totalScore: 0 });
        }

        const communitiesCount = await prisma.communityMember.count({
            where: { userId: session.user.id }
        });

        const ObjectWithScore = await prisma.post.findMany({
            where: { authorId: session.user.id },
            select: {
                _count: {
                    select: { likes: true }
                }
            }
        });

        const totalScore = ObjectWithScore.reduce((sum, post) => sum + (post._count?.likes || 0), 0);

        return NextResponse.json({ communitiesCount, totalScore }, { status: 200 });

    } catch (error: any) {
        console.error("GET_USER_METRICS_ERROR:", error);
        return NextResponse.json(
            { communitiesCount: 0, totalScore: 0 },
            { status: 500 }
        );
    }
}
