import { apiClient } from "./apiClient";

export type User = {
    id: number;
    name: string;
};

export type RegisterUserResponse = User & {
    created: boolean;
};

export const userService = {
    getUsers() {
        return apiClient.get<User[]>("/users");
    },

    getUser(userId: number) {
        return apiClient.get<User>(`/users/${userId}`);
    },

    register(name: string) {
        return apiClient.post<RegisterUserResponse>("/users/register", { name });
    },
};