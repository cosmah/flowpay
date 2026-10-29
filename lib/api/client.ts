import axios from "axios"

/**
 * Shared HTTP client. Point NEXT_PUBLIC_API_URL at your Supabase Edge
 * Functions or API gateway when the backend is ready.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again."
    return Promise.reject(new Error(message))
  }
)
