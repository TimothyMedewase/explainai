import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Helper function to make authenticated API calls to the backend
 */
export async function callApi(
  endpoint: string,
  options: {
    headers?: Record<string, string>;
    method?: string;
    body?: any;
  } = {},
  token?: string | null
) {
  const defaultOptions = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  });
}

/**
 * Hook for accessing API functionality with authentication
 */
export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  return {
    async processFiles(files: File[], query: string) {
      const token = await getToken();
      return _processFiles(files, query, token);
    },
    async processFilesStream(
      files: File[],
      query: string,
      onChunk: (partialText: string) => void
    ) {
      const token = await getToken();
      return _processFilesStream(files, query, onChunk, token);
    },
  };
}

function buildProcessFormData(files: File[], query: string): FormData {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("query", query);
  return formData;
}

function extractResultText(response: any): string {
  let resultText = "Sorry, I couldn't process your query.";

  if (typeof response === "string") {
    return response;
  }

  if (response?.response?.result) {
    resultText = String(response.response.result);
  } else if (typeof response?.response === "string") {
    resultText = response.response;
  } else if (response?.result) {
    resultText = String(response.result);
  } else if (response?.content) {
    resultText = String(response.content);
  } else if (response?.text) {
    resultText = String(response.text);
  } else if (response) {
    resultText = JSON.stringify(response);
  }

  return resultText;
}

function readTextFromChunk(chunk: string): string {
  const trimmed = chunk.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("data:")) {
    const payload = trimmed
      .split("\n")
      .map((line) => line.replace(/^data:\s?/, ""))
      .join("\n")
      .trim();

    if (!payload || payload === "[DONE]") return "";

    try {
      const parsed = JSON.parse(payload);
      return extractResultText(parsed);
    } catch {
      return payload;
    }
  }

  try {
    const parsed = JSON.parse(trimmed);
    return extractResultText(parsed);
  } catch {
    // chunk may be plain text token data
  }

  return trimmed;
}

/**
 * Uploads files to the backend processing endpoint with a query
 * @param files Array of files to upload
 * @param query The user query to process with the files
 * @param token Authentication token (optional)
 * @returns The processed result from the backend
 */
export async function _processFiles(
  files: File[],
  query: string,
  token?: string | null
) {
  const formData = buildProcessFormData(files, query);

  try {
    console.log(
      `Sending ${files.length} files to backend with query: "${query}"`
    );
    console.log("API URL being used:", `${API_BASE_URL}/process`);

    const response = await callApi(
      "/process",
      {
        method: "POST",
        body: formData,
      },
      token
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error (${response.status}):`, errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    return data;
  } catch (error) {
    console.error("Error processing files:", error);
    throw error;
  }
}

export async function _processFilesStream(
  files: File[],
  query: string,
  onChunk: (partialText: string) => void,
  token?: string | null
): Promise<string> {
  const formData = buildProcessFormData(files, query);

  const response = await callApi(
    "/process",
    {
      method: "POST",
      body: formData,
      headers: {
        Accept:
          "text/event-stream, application/x-ndjson, application/json, text/plain",
      },
    },
    token
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server responded with ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    const json = await response.json();
    const finalText = extractResultText(json);
    onChunk(finalText);
    return finalText;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let partial = "";
  let streamedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    partial += decoder.decode(value, { stream: true });
    const split = partial.split(/\n\n|\r\n\r\n|\n|\r\n/);
    partial = split.pop() ?? "";

    for (const part of split) {
      const piece = readTextFromChunk(part);
      if (piece) {
        streamedText += piece;
        onChunk(streamedText);
      }
    }
  }

  partial += decoder.decode();
  const tail = readTextFromChunk(partial);
  if (tail) {
    streamedText += tail;
    onChunk(streamedText);
  }

  if (!streamedText.trim()) {
    try {
      const parsed = JSON.parse(partial);
      streamedText = extractResultText(parsed);
      onChunk(streamedText);
    } catch {
      if (partial.trim()) {
        streamedText = partial.trim();
        onChunk(streamedText);
      }
    }
  }

  const normalized = streamedText.trim();
  if (normalized.startsWith("{") || normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized);
      const extracted = extractResultText(parsed);
      if (extracted && extracted !== streamedText) {
        streamedText = extracted;
        onChunk(streamedText);
      }
    } catch {
      // keep streamed text when not valid JSON
    }
  }

  return streamedText;
}

// Export a non-hook version for compatibility
export const processFiles = _processFiles;
