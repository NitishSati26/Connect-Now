import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// const BASE_URL = "http://localhost:5001";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_BASE_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      get().connectSocket();
    } catch {
      // console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIng: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIng: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });

      // Refresh users list to update profile images in sidebar
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().getUsers();

      toast.success("Profile updated successfully");
    } catch {
      // console.log("Error in Update Profile");
      toast.error("An error occurred while updating profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket: socket });

    socket.on("connect", () => {
      // console.log("Socket connected, subscribing to events");

      // Subscribe to global group events for real-time group updates
      import("./useGroupStore").then(({ useGroupStore }) => {
        // console.log("Importing useGroupStore for subscription");
        useGroupStore.getState().subscribeToGlobalGroupEvents();
      });

      // Subscribe to global message events for real-time user list updates
      import("./useChatStore").then(({ useChatStore }) => {
        // console.log("Importing useChatStore for subscription");
        useChatStore.getState().subscribeToGlobalMessages();
      });

      // Join user to all their group rooms
      // console.log("Joining user to group rooms:", authUser._id);
      socket.emit("joinGroups", authUser._id);
    });

    socket.on("disconnect", () => {
      // console.log("Socket disconnected");
    });

    socket.on("connect_error", () => {
      // console.error("Socket connection error:", error);
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Listen for real-time profile updates
    socket.on("profileUpdated", async (data) => {
      // console.log("Profile updated in real-time:", data);

      // Update the current user's profile if it's their own update
      if (data.userId === authUser._id) {
        set({
          authUser: {
            ...authUser,
            profilePic: data.profilePic,
            updatedAt: data.updatedAt,
          },
        });
      }

      // Update the specific user in the chat store for real-time updates
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().updateUserProfile(data.userId, data);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
