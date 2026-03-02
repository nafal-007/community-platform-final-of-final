import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, memberId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const communityId = resolvedParams.id;
        const memberIdToRemove = resolvedParams.memberId;

        // Verify the requester has admin rights in this community
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    where: { userId: session.user.id }
                }
            }
        });

        if (!community) {
            return NextResponse.json({ message: "Community not found" }, { status: 404 });
        }

        const isPlatformAdmin = session.user.role === "ADMIN";
        const isCommunityAdmin = community.members.length > 0 && community.members[0].role === "ADMIN";

        if (!isPlatformAdmin && !isCommunityAdmin) {
            return NextResponse.json({ message: "Forbidden. Admin privileges required." }, { status: 403 });
        }

        // Determine the CommunityMember ID to delete
        // We know the communityId and the userId of the person to remove
        const memberRecord = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: memberIdToRemove,
                    communityId: communityId
                }
            }
        });

        if (!memberRecord) {
            return NextResponse.json({ message: "User is not a member of this community" }, { status: 404 });
        }

        // Prevent admin from removing themselves via this route
        if (memberIdToRemove === session.user.id && !isPlatformAdmin) {
            return NextResponse.json({ message: "You cannot remove yourself using this action." }, { status: 400 });
        }

        await prisma.communityMember.delete({
            where: { id: memberRecord.id }
        });

        return NextResponse.json({ message: "Member removed successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("REMOVE_MEMBER_ERROR:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
