# PDF Text Extraction Setup Guide

This guide explains how to implement PDF text extraction in a Next.js environment using the `pdf-parse` library.

## 1. Install Dependencies

First, install the `pdf-parse` package:

```bash
npm install pdf-parse
```

## 2. Create the API Route

Create a new API route at `app/api/pdf/route.js`. 

### Key Implementation Details:
- **Class-based API**: Since `pdf-parse` v2.4.5+, you must use the named export `PDFParse` as a class.
- **Worker Configuration**: In Next.js server environments, you must explicitly set the worker source to avoid "fake worker" errors.

```javascript
import { PDFParse } from "pdf-parse";
import path from "path";

// 1. Configure the PDF worker path
// This is critical for Next.js to find the worker script in node_modules
const workerPath = path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
PDFParse.setWorker(workerPath);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Instantiate PDFParse and extract text
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
```

## 3. Create a Test Page

Create a test page at `app/test/page.js` to verify the functionality.

```javascript
"use client";

import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: err.message }, null, 2));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF Test Upload</h2>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      <pre style={{ 
        marginTop: 20, 
        padding: 10, 
        backgroundColor: "#f4f4f4", 
        border: "1px solid #ccc",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all"
      }}>
        {result}
      </pre>
    </div>
  );
}
```

## 4. Troubleshooting

### Common Errors:
- **"Export default doesn't exist"**: Ensure you use `import { PDFParse } from "pdf-parse"` instead of a default import.
- **"Setting up fake worker failed"**: This usually happens if `PDFParse.setWorker()` is not called or the path is incorrect. Use the absolute path provided in step 2.
- **Scanned PDFs**: If `fullText` is empty or gibberish, the PDF is likely an image (scanned). You would need an OCR solution (like `Tesseract.js`) for those.
