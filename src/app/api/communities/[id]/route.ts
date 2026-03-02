import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const communityId = resolvedParams.id;

        // Verify the requester is a platform admin or the community founder (Admin)
        const membership = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: session.user.id,
                    communityId: communityId
                }
            }
        });

        const isPlatformAdmin = session.user.role === "ADMIN";
        const isCommunityAdmin = membership && membership.role === "ADMIN";

        if (!isPlatformAdmin && !isCommunityAdmin) {
            return NextResponse.json({ message: "Forbidden. Only admins can delete the community." }, { status: 403 });
        }

        // Delete the community (Cascades to members, posts if schema is set, or manually clean them)
        // Note: Prisma cascade delete relies on schema setup. Since we made relations cascade in Phase 1, we can just delete it.
        await prisma.community.delete({
            where: { id: communityId }
        });

        return NextResponse.json({ message: "Community deleted successfully." }, { status: 200 });

    } catch (error: any) {
        console.error("DELETE_COMMUNITY_ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
