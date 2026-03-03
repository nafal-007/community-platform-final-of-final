import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const postId = resolvedParams.id;

        // Fetch post to verify ownership or admin status
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { community: { include: { members: true } } }
        });

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        // Check permissions: Author, Global Admin, or Community Admin
        const isAuthor = post.authorId === session.user.id;
        const isGlobalAdmin = session.user.role === "ADMIN";
        const isCommunityAdmin = post.community.members.some(
            m => m.userId === session.user.id && m.role === "ADMIN"
        );

        if (!isAuthor && !isGlobalAdmin && !isCommunityAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("DELETE_POST_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
