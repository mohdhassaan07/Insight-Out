import { NextResponse } from "next/server";
import { Readable } from "stream";
import csv from "csv-parser";
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File || null;
        if (!file) {
            return NextResponse.json({
                error: "No file uploaded",
                status: 404
            })
        }
        if (file.type !== "text/csv") {
            return NextResponse.json(
                { error: "Only CSV files are allowed" },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const results: any[] = [];

        await new Promise<void>((resolve, reject) => {
            Readable.from(buffer)
                .pipe(csv())
                .on("data", (row) => {
                    results.push(row);
                })
                .on("end", () => resolve())
                .on("error", reject);
        });
        return NextResponse.json({ data: results }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}