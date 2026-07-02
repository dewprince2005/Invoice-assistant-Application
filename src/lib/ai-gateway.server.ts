// Server-only AI helper.
// Uses OpenAI gpt-4o (vision) for invoice data extraction.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export interface ExtractedInvoice {
  invoiceNumber: string;
  vendorName: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
}

const SYSTEM_PROMPT = `You are a precise invoice data extractor. Given an invoice image or PDF, extract these fields and return ONLY a JSON object — no prose, no markdown fences.

{
  "invoiceNumber": "",
  "vendorName": "",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "lineItems": [{ "description": "", "quantity": 0, "unitPrice": 0, "total": 0 }],
  "subtotal": 0,
  "tax": 0,
  "total": 0
}

Rules:
- Use empty string "" for unknown text fields and 0 for unknown numbers.
- Dates MUST be ISO YYYY-MM-DD. If only month/year present, use the 1st.
- Numbers must be plain numbers (no currency symbols, no thousands separators).
- Always include all top-level keys.`;

export async function extractInvoiceFromFile(args: {
  base64: string;
  mimeType: string;
}): Promise<ExtractedInvoice> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured in .env");

  const dataUrl = `data:${args.mimeType};base64,${args.base64}`;
  const userContent: any[] = [
    { type: "text", text: "Extract the invoice fields. Return only the JSON object." },
    { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("OpenAI rate limit reached. Please try again in a minute.");
    if (res.status === 401) throw new Error("Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.");
    if (res.status === 402 || res.status === 403) throw new Error("OpenAI quota exhausted or billing issue. Check your OpenAI account.");
    throw new Error(`OpenAI API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("OpenAI returned an empty response");

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to strip code fences if any
    const cleaned = content.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  }

  return {
    invoiceNumber: String(parsed.invoiceNumber ?? ""),
    vendorName: String(parsed.vendorName ?? ""),
    issueDate: String(parsed.issueDate ?? ""),
    dueDate: String(parsed.dueDate ?? ""),
    lineItems: Array.isArray(parsed.lineItems)
      ? parsed.lineItems.map((li: any) => ({
          description: String(li?.description ?? ""),
          quantity: Number(li?.quantity ?? 0) || 0,
          unitPrice: Number(li?.unitPrice ?? 0) || 0,
          total: Number(li?.total ?? 0) || 0,
        }))
      : [],
    subtotal: Number(parsed.subtotal ?? 0) || 0,
    tax: Number(parsed.tax ?? 0) || 0,
    total: Number(parsed.total ?? 0) || 0,
  };
}
