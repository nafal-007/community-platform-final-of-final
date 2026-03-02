import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized. Please log in to post." },
                { status: 401 }
            );
        }

        const { title, content, mediaUrl, mediaType } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { message: "Title and content are required." },
                { status: 400 }
            );
        }

        // Verify community exists
        const resolvedParams = await params;
        const community = await prisma.community.findUnique({
            where: { id: resolvedParams.id }
        });

        if (!community) {
            return NextResponse.json(
                { message: "Community not found." },
                { status: 404 }
            );
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                mediaUrl,
                mediaType,
                authorId: session.user.id,
                communityId: community.id,
                validityScore: 0 // Base score
            }
        });

        return NextResponse.json(
            { message: "Post created successfully", post },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("CREATE_POST_ERROR RAW:", error);
        console.error("CREATE_POST_ERROR MESSAGE:", error.message);
        console.error("CREATE_POST_ERROR STACK:", error.stack);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
