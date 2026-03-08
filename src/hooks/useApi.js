import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const queryKeys = {
	passwords: ["passwords"],
	categories: ["categories"],
	folders: ["folders"],
	stats: ["stats"],
	breachScan: ["breach-scan"],
	userProfile: ["userProfile"],
	secureNotes: ["secureNotes"],
	sharedLinks: ["sharedLinks"],
};

// User profile
export const useUserProfile = () => {
	return useQuery({
		queryKey: queryKeys.userProfile,
		queryFn: async () => {
			const response = await fetch("/api/user/profile");
			if (!response.ok)
				throw new Error("Erreur lors du chargement du profil");
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Passwords
export const usePasswords = () => {
	return useQuery({
		queryKey: queryKeys.passwords,
		queryFn: async () => {
			const response = await fetch("/api/passwords");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useAddPassword = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (passwordData) => {
			const response = await fetch("/api/passwords", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(passwordData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passwords });
			queryClient.invalidateQueries({ queryKey: queryKeys.stats });
		},
	});
};

export const useUpdatePassword = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...passwordData }) => {
			const response = await fetch(`/api/passwords/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(passwordData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passwords });
			queryClient.invalidateQueries({ queryKey: queryKeys.stats });
		},
	});
};

export const useDeletePassword = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const response = await fetch(`/api/passwords/${id}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passwords });
			queryClient.invalidateQueries({ queryKey: queryKeys.stats });
		},
	});
};

// Categories
export const useCategories = () => {
	return useQuery({
		queryKey: queryKeys.categories,
		queryFn: async () => {
			const response = await fetch("/api/categories");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

// Folders
export const useFolders = () => {
	return useQuery({
		queryKey: queryKeys.folders,
		queryFn: async () => {
			const response = await fetch("/api/folders");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useAddFolder = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (folderData) => {
			const response = await fetch("/api/folders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(folderData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders });
		},
	});
};

export const useDeleteFolder = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const response = await fetch(`/api/folders/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Erreur lors de la suppression");
			return { id };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders });
		},
	});
};

export const useUpdateFolder = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...folderData }) => {
			const response = await fetch(`/api/folders/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(folderData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders });
		},
	});
};

// Stats
export const useStats = () => {
	return useQuery({
		queryKey: queryKeys.stats,
		queryFn: async () => {
			const response = await fetch("/api/stats");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useBreachScan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/security/breach-scan", {
				method: "POST",
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.stats });
			queryClient.invalidateQueries({ queryKey: queryKeys.passwords });
		},
	});
};

export const useManualPasswordCheck = () => {
	return useMutation({
		mutationFn: async (password) => {
			const response = await fetch("/api/security/password-check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

// ── Secure Notes ────────────────────────────────────────────────────────────

export const useSecureNotes = () => {
	return useQuery({
		queryKey: queryKeys.secureNotes,
		queryFn: async () => {
			const response = await fetch("/api/secure-notes");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useAddSecureNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (noteData) => {
			const response = await fetch("/api/secure-notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(noteData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.secureNotes });
		},
	});
};

export const useUpdateSecureNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...noteData }) => {
			const response = await fetch(`/api/secure-notes/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(noteData),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.secureNotes });
		},
	});
};

export const useDeleteSecureNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const response = await fetch(`/api/secure-notes/${id}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.secureNotes });
		},
	});
};

// ── Import / Export ─────────────────────────────────────────────────────────

export const useImportPasswords = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (csvContent) => {
			const response = await fetch("/api/passwords/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ csvContent }),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passwords });
			queryClient.invalidateQueries({ queryKey: queryKeys.stats });
		},
	});
};

// ── Password Sharing ─────────────────────────────────────────────────────────

export const useSharePassword = () => {
	return useMutation({
		mutationFn: async ({ passwordId, expiresInHours, maxViews }) => {
			const response = await fetch("/api/share", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passwordId, expiresInHours, maxViews }),
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useMySharedLinks = () => {
	return useQuery({
		queryKey: queryKeys.sharedLinks,
		queryFn: async () => {
			const response = await fetch("/api/share");
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data.data;
		},
	});
};

export const useRevokeShareLink = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (token) => {
			const response = await fetch(`/api/share/${token}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (!data.success) throw new Error(data.error);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.sharedLinks });
		},
	});
};
