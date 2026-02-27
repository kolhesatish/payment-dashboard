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
