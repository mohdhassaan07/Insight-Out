import crypto from "crypto";
import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024;
const PROFILE_PIC_FIELD_NAMES = ["profilePic", "profilePicFile", "avatar", "image"];

type ProfilePayload = {
    name?: string;
    organizationName?: string;
    profilePic?: File;
};

function getStringValue(value: FormDataEntryValue | null) {
    return typeof value === "string" ? value.trim() : undefined;
}

function getProfilePic(formData: FormData) {
    for (const fieldName of PROFILE_PIC_FIELD_NAMES) {
        const value = formData.get(fieldName);
        if (value && typeof value === "object" && "size" in value && (value as any).size > 0) {
            return value as File;
        }
    }
}

async function readPayload(req: NextRequest): Promise<ProfilePayload> {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();

        return {
            name: getStringValue(formData.get("name")),
            organizationName: getStringValue(formData.get("organizationName")),
            profilePic: getProfilePic(formData),
        };
    }

    const body = await req.json();

    return {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        organizationName: typeof body.organizationName === "string" ? body.organizationName.trim() : undefined,
    };
}

function createCloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
    const signaturePayload = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    return crypto
        .createHash("sha1")
        .update(`${signaturePayload}${apiSecret}`)
        .digest("hex");
}

async function uploadProfilePic(file: File) {
    if (!file.type.startsWith("image/")) {
        throw new Error("INVALID_IMAGE_TYPE");
    }

    if (file.size > MAX_PROFILE_PIC_SIZE) {
        throw new Error("IMAGE_TOO_LARGE");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("CLOUDINARY_NOT_CONFIGURED");
    }

    const timestamp = Math.round(Date.now() / 1000);
    const uploadParams = {
        folder: "feedback-categorizer/profile-pics",
        timestamp,
    };
    const signature = createCloudinarySignature(uploadParams, apiSecret);
    const formData = new FormData();

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    formData.append("file", fileUri);
    formData.append("api_key", apiKey);
    formData.append("folder", uploadParams.folder);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("CLOUDINARY_UPLOAD_FAILED");
    }

    const uploadedImage = await response.json();
    return uploadedImage.secure_url as string;
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, organizationName, profilePic } = await readPayload(req);
        const userData: { name?: string; profilePic?: string } = {};

        if (name !== undefined && name !== "") {
            if (name.length < 3 || name.length > 100) {
                return NextResponse.json({ error: "Name must be between 3 and 100 characters" }, { status: 400 });
            }
            userData.name = name;
        }

        if (profilePic) {
            userData.profilePic = await uploadProfilePic(profilePic);
        }

        const organizationData: { name?: string } = {};

        if (organizationName !== undefined && organizationName !== "") {
            if (organizationName.length < 1 || organizationName.length > 100) {
                return NextResponse.json({ error: "Organization name must be between 1 and 100 characters" }, { status: 400 });
            }
            organizationData.name = organizationName;
        }

        if (Object.keys(userData).length === 0 && Object.keys(organizationData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const [user, organization] = await prisma.$transaction([
            Object.keys(userData).length > 0
                ? prisma.user.update({
                    where: { email: session.user.email },
                    data: userData,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePic: true,
                        organizationId: true,
                    },
                })
                : prisma.user.findUniqueOrThrow({
                    where: { email: session.user.email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePic: true,
                        organizationId: true,
                    },
                }),
            Object.keys(organizationData).length > 0
                ? prisma.organization.update({
                    where: { id: session.user.organizationId },
                    data: organizationData,
                    select: {
                        id: true,
                        name: true,
                    },
                })
                : prisma.organization.findUniqueOrThrow({
                    where: { id: session.user.organizationId },
                    select: {
                        id: true,
                        name: true,
                    },
                }),
        ]);

        return NextResponse.json({
            message: "Profile updated successfully",
            user,
            organization,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_IMAGE_TYPE") {
                return NextResponse.json({ error: "Profile picture must be an image" }, { status: 400 });
            }
            if (error.message === "IMAGE_TOO_LARGE") {
                return NextResponse.json({ error: "Profile picture must be 5MB or smaller" }, { status: 400 });
            }
            if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
                return NextResponse.json({ error: "Cloudinary environment variables are not configured" }, { status: 500 });
            }
            if (error.message === "CLOUDINARY_UPLOAD_FAILED") {
                return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 502 });
            }
        }
        
        console.error("Profile update error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update profile" }, { status: 500 });
    }
}
