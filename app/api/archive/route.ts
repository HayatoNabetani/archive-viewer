import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { parseHTML } from "linkedom";
import { NextRequest } from "next/server";

function cleanHtmlContent(url: string, htmlContent: string) {
    const { document } = parseHTML(htmlContent);

    // Remove id=HEADER and id=DIVSHARE elements
    const idsToRemove = ["HEADER", "DIVSHARE"];
    idsToRemove.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    });

    // Extract the content div with class="html"
    const contentDiv = document.querySelector(".html");
    if (contentDiv) {
        // Replace the body with just the content div
        const body = document.createElement("body");
        body.appendChild(contentDiv.cloneNode(true));
        document.body.replaceWith(body);
    }

    // style="padding:200px 0;min-width:1028px;background-color:#EEEEEE"となっているものを全て削除する
    const elementsWithStyle = document.querySelectorAll(
        '[style="padding:200px 0;min-width:1028px;background-color:#EEEEEE"]'
    );
    elementsWithStyle.forEach((element) => {
        element.removeAttribute("style");
    });

    // 全てのhrefやsrc属性にurlを付与
    const baseUrl = new URL(url);

    // href属性を持つ全ての要素を更新
    document.querySelectorAll("[href]").forEach((element) => {
        const href = element.getAttribute("href");
        if (href && !href.startsWith("http")) {
            const newHref = new URL(href, baseUrl).toString();
            element.setAttribute("href", newHref);
        }
    });

    // src属性を持つ全ての要素を更新
    document.querySelectorAll("[src]").forEach((element) => {
        const src = element.getAttribute("src");
        if (src && !src.startsWith("http")) {
            const newSrc = new URL(src, baseUrl).toString();
            element.setAttribute("src", newSrc);
        }
    });

    const style = document.createElement("style");
    style.textContent = `
        body {
            width: 100%;
            min-height: unset !important;
            overflow-x: hidden; /* 横スクロールを防ぐ */
        }

        body * {
            max-width: 100% !important;
            min-height: unset !important;
            box-sizing: border-box;
        }

        .body {
            margin: 0 auto !important;
        }

        img {
            max-height: 100vh !important;
            max-width: 100% !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
            min-height: unset !important;
            min-width: unset !important;
        }
    `;
    document.head.appendChild(style);

    return document.toString();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const proxy = "http://156.228.114.16:3128";

    if (!url) {
        return new Response(JSON.stringify({ error: "Missing url or proxy" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const headers = {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        priority: "u=0, i",
        "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    };

    try {
        const agent = new HttpsProxyAgent(proxy);
        const response = await axios.get(url, {
            headers,
            httpAgent: agent,
            // httpsAgent: agent,
        });

        try {
            const htmlContent = response.data;
            const cleanedHtml = cleanHtmlContent(url, htmlContent);

            return new Response(cleanedHtml, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    // iframe 対応用ヘッダー
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
