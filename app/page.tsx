"use client";

import { useState } from "react";

export default function Home() {
    const [url, setUrl] = useState("https://archive.md/ojnLd");
    const [iframeUrl, setIframeUrl] = useState("/proxy");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            try {
                new URL(url);
                setIframeUrl(
                    `/api/archive?url=${encodeURIComponent(url)}`
                );
            } catch (error) {
                console.error(error);
                alert("有効なURLを入力してください");
            }
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-2xl w-full items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    Next.js 15 iframe プロキシ
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex w-full max-w-3xl mx-auto mb-8"
                >
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URLを入力"
                        className="flex-grow px-4 py-2 text-base border border-gray-300 rounded-l-md"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-base bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                        表示
                    </button>
                </form>

                <div className="w-full border border-gray-300 rounded-md">
                    <iframe
                        src={iframeUrl}
                        width="100%"
                        height="700"
                        className="rounded-md"
                    />
                </div>

                <div className="w-full border border-gray-300 rounded-md">
                    <iframe
                        src={url}
                        width="100%"
                        height="700"
                        className="rounded-md"
                    />
                </div>
            </div>
        </main>
    );
}
