import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const queryKeys = {
    passwords: ["passwords"],
    categories: ["categories"],
    folders: ["folders"],
    stats: ["stats"],
    securityLogs: ["securityLogs"],
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
                method: "PUT",
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

// Security Logs
export const useSecurityLogs = () => {
    return useQuery({
        queryKey: queryKeys.securityLogs,
        queryFn: async () => {
            const response = await fetch("/api/security-logs");
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });
};
