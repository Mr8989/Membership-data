import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage"



export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,

    signup: async ({ email, password, confirmPassword }) => {
        set({ isLoading: true })

        if (password !== confirmPassword) {
            set({ isLoading: false })
            return;
        }

        try {
            const res = await axiosInstance.post("/auth/signup", { email, password });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong")
            }

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({ user: res.data.user, token: res.data.token, isLoading: false })

            return { success: true }
        } catch (error) {
            console.log(error);
            set({ isLoading: false })
            throw (error.response?.data?.message || "Error at signup")
            return { success: false, error: error.message }
        }
    },
    login: async ({ email, password }) => {
        set({ isLoading: true })
        try {
            const res = await axiosInstance.post("/auth/login", { email, password });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed")
            }
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);
            const { user, token } = res.data
            set({ user, token, isLoading: false })
        } catch (error) {
            console.log(error)
            set({ isLoading: false })
            throw new Error(error.response?.data?.message || "Error at login")
        }

    },
    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
     
            const user = userJson ? JSON.parse(userJson) : null;
     
            set({ token, user})
        } catch (error) {
            console.log("Auth check failed", error)
        }
    },
    logout: async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({token: null, user: null});
    }
}))
