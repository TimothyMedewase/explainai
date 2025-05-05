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
  };
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
  // Create a FormData object to handle the file uploads
  const formData = new FormData();

  // Append each file to the FormData
  files.forEach((file) => {
    formData.append(`files`, file);
  });

  // Append the query parameter
  formData.append("query", query);

  try {
    console.log(
      `Sending ${files.length} files to backend with query: "${query}"`
    );
    console.log("API URL being used:", `${API_BASE_URL}/process`);

    const response = await callApi(
      "/process",
      {
        method: "POST",
        // Don't set Content-Type header manually; browser will set it correctly with boundary
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

// Export a non-hook version for compatibility
export const processFiles = _processFiles;
