import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const userId = (await params).id;

    try {
        await connectToDatabase();
        const db = mongoose.connection.db;
        const user = await db?.collection("user").findOne({ 
            _id: new mongoose.Types.ObjectId(userId) 
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Exclude sensitive fields
        const { password, ...safeUser } = user as Record<string, unknown>;
        return NextResponse.json(safeUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
}