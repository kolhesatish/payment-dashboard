import { PDFParse } from "pdf-parse";
import path from "path";

// Set the worker source for PDF.js to avoid "fake worker failed" error in Next.js
const workerPath = path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
PDFParse.setWorker(workerPath);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();

        return Response.json({
            success: true,
            fullText: data.text,
            charCount: data.text.length,
        });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
