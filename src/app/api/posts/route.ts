import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        const userId = session?.user?.id;

        // Build where clause dynamically for Prisma v5 safety
        const whereClause: any = {
            OR: [
                {
                    community: { isPrivate: false }
                }
            ]
        };

        if (userId) {
            whereClause.OR.push({
                community: {
                    members: {
                        some: { userId: userId }
                    }
                }
            });
        }

        // Fetch posts balancing global discoverability with private community privacy
        const posts = await prisma.post.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                community: {
                    select: {
                        name: true,
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50 // Limit to latest 50 posts
        });

        return NextResponse.json(posts);

    } catch (error: any) {
        console.error("GET_GLOBAL_POSTS_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
