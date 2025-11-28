"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }) {
    return (
        <SessionProvider
            basePath="/api/auth"
            refetchInterval={5 * 60}
            refetchOnWindowFocus={true}
        >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
