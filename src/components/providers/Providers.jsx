"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReauthProvider } from "@/contexts/ReauthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export function Providers({ children, session }) {
	return (
		<SessionProvider session={session} refetchOnWindowFocus={false}>
			<QueryClientProvider client={queryClient}>
				<LanguageProvider>
					<ReauthProvider>
						<TutorialProvider>{children}</TutorialProvider>
					</ReauthProvider>
				</LanguageProvider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
