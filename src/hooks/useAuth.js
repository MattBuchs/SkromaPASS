"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
    try {
        const { data: session, status } = useSession();

        return {
            user: session?.user || null,
            isAuthenticated: status === "authenticated",
            isLoading: status === "loading",
            status,
        };
    } catch (error) {
        console.error("Error in useAuth:", error);
        return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            status: "unauthenticated",
        };
    }
}
