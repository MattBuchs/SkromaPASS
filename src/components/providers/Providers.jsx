"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReauthProvider } from "@/contexts/ReauthContext";

export function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                <ReauthProvider>{children}</ReauthProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
