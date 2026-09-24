import { FastAPIValidationError, FastAPIValidationErrorDetail } from "@/types/api";

const DEFAULT_TIMEOUT_MS = 45000;

export class ApiError extends Error {
  public status: number;
  public details?: string | FastAPIValidationErrorDetail[];

  constructor(message: string, status: number, details?: string | FastAPIValidationErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Resolves the backend base URL from environment variables.
 * Never hardcodes environment-specific URLs inside components.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url || url.trim() === "") {
    // Default fallback in development
    return "http://localhost:8000";
  }
  return url.replace(/\/+$/, "");
}

/**
 * Standardized typed HTTP fetcher with timeout and response normalization.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API request failed with HTTP ${response.status}`;
      let errorDetails: string | FastAPIValidationErrorDetail[] | undefined;

      try {
        const errorJson = (await response.json()) as FastAPIValidationError | { detail?: string; error?: string };
        if ("detail" in errorJson) {
          if (Array.isArray(errorJson.detail)) {
            // FastAPI Pydantic Validation Error (422)
            errorMessage = errorJson.detail
              .map((d) => `${d.loc.slice(1).join(".")}: ${d.msg}`)
              .join(" | ");
            errorDetails = errorJson.detail;
          } else if (typeof errorJson.detail === "string") {
            errorMessage = errorJson.detail;
            errorDetails = errorJson.detail;
          }
        } else if ("error" in errorJson && typeof errorJson.error === "string") {
          errorMessage = errorJson.error;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Request timed out. The backend service may be cold-starting or handling an intensive workload.",
        408
      );
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        `Unable to reach the backend API at ${baseUrl}. Ensure the service is online and CORS is configured.`,
        0
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected network error occurred.",
      500
    );
  }
}
