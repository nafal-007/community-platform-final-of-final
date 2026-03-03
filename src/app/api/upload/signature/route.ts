import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const timestamp = Math.round((new Date).getTime() / 1000);

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: 'community_platform',
            },
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        }, { status: 200 });

    } catch (error) {
        console.error("Signature error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
