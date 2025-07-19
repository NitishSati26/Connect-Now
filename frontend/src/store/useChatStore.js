import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateUserOrder: (senderId) => {
    set((state) => {
      const updatedUsers = [...state.users];
      const userIndex = updatedUsers.findIndex((user) => user._id === senderId);

      if (userIndex > 0) {
        // Move user to top of list
        const [user] = updatedUsers.splice(userIndex, 1);
        updatedUsers.unshift(user);
      }

      return { users: updatedUsers };
    });
  },

  updateUserProfile: (userId, profileData) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId
          ? {
              ...user,
              profilePic: profileData.profilePic,
              updatedAt: profileData.updatedAt,
            }
          : user
      ),
    }));
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);

      // Update unread count for this user immediately
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? { ...user, unreadCount: 0 } : user
        ),
      }));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // Mark messages as read when opening conversation
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  updateUserUnreadCount: (senderId, increment = 1) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === senderId
          ? { ...user, unreadCount: (user.unreadCount || 0) + increment }
          : user
      ),
    }));
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });

      // Move current user to top of list when sending message
      get().updateUserOrder(selectedUser._id);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });

      // Move sender to top of users list when receiving message
      get().updateUserOrder(newMessage.senderId);

      // Don't increment unread count if we're currently viewing this conversation
      // The message will be marked as read automatically
    });
  },

  // Subscribe to global message events (not tied to selected user)
  subscribeToGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log("Subscribing to global messages");

    // Refresh users list to get latest unread counts
    get().getUsers();

    socket.on("newMessage", (newMessage) => {
      console.log("Global message received:", newMessage);

      // Move sender to top of users list when receiving any message
      get().updateUserOrder(newMessage.senderId);

      // Only increment unread count if not currently viewing this conversation
      // AND if the message is from someone else (not from current user)
      const currentState = get();
      const { selectedUser } = currentState;
      const authUser = useAuthStore.getState().authUser;

      const isFromCurrentUser = newMessage.senderId === authUser._id;
      const isCurrentlyViewing =
        selectedUser && selectedUser._id === newMessage.senderId;

      console.log("Message conditions:", {
        isFromCurrentUser,
        isCurrentlyViewing,
        senderId: newMessage.senderId,
        authUserId: authUser._id,
      });

      if (!isFromCurrentUser && !isCurrentlyViewing) {
        console.log("Incrementing unread count for:", newMessage.senderId);
        get().updateUserUnreadCount(newMessage.senderId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  unsubscribeFromGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
