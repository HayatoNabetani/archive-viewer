import axios from "axios";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    try {
        try {
            const response = await axios.get(url!);

            return new Response(response.data, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "X-Frame-Options": "ALLOWALL",
                    "Content-Security-Policy": "frame-ancestors *",
                },
            });
        } catch (error) {
            console.error("Error processing archive:", error);
            return new Response("Error processing archive", {
                status: 500,
            });
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return new Response(
            JSON.stringify({ error: "Fetch failed", detail: error }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
