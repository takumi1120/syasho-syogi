const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            typeof data === "object" &&
                data !== null &&
                "message" in data &&
                typeof (data as { message?: unknown }).message === "string"
                ? (data as { message: string }).message
                : `request failed: ${response.status}`;

        throw new Error(message);
    }

    return data as T;
}

export const apiClient = {
    get<T>(path: string) {
        return request<T>(path, { method: "GET" });
    },

    post<T>(path: string, body?: unknown) {
        return request<T>(path, { method: "POST", body });
    },

    patch<T>(path: string, body?: unknown) {
        return request<T>(path, { method: "PATCH", body });
    },

    put<T>(path: string, body?: unknown) {
        return request<T>(path, { method: "PUT", body });
    },

    delete<T>(path: string, body?: unknown) {
        return request<T>(path, { method: "DELETE", body });
    },
};