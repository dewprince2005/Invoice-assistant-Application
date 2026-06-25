// Server-only Lovable AI Gateway helper.
// Used by server functions to call vision-capable models for invoice extraction.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const dataUrl = `data:${args.mimeType};base64,${args.base64}`;
  const userContent: any[] = [
    { type: "text", text: "Extract the invoice fields. Return only the JSON object." },
  ];

  if (args.mimeType.startsWith("image/")) {
    userContent.push({ type: "image_url", image_url: { url: dataUrl } });
  } else if (args.mimeType === "application/pdf") {
    // OpenRouter/Gemini accept PDFs via image_url with a data URL too for vision-capable models.
    userContent.push({ type: "image_url", image_url: { url: dataUrl } });
  } else {
    throw new Error(`Unsupported MIME type for extraction: ${args.mimeType}`);
  }

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "custom",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI returned an empty response");

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
