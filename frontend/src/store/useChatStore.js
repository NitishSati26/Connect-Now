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
      await get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  updateUserUnreadCount: (senderId, increment = 1) => {
    console.log(
      "Updating unread count for:",
      senderId,
      "increment:",
      increment
    );
    set((state) => {
      const updatedUsers = state.users.map((user) => {
        if (user._id === senderId) {
          const newCount = (user.unreadCount || 0) + increment;
          console.log(
            `User ${user.fullName}: ${user.unreadCount || 0} -> ${newCount}`
          );
          return { ...user, unreadCount: newCount };
        }
        return user;
      });
      return { users: updatedUsers };
    });
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
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const currentState = get();
      const authUser = useAuthStore.getState().authUser;

      // Check if this message belongs to the current conversation
      const isMessageForCurrentChat =
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === authUser._id) ||
        (newMessage.senderId === authUser._id &&
          newMessage.receiverId === selectedUser._id);

      if (!isMessageForCurrentChat) return;

      // Avoid duplicate messages
      const messageExists = currentState.messages.some(
        (msg) => msg._id === newMessage._id
      );
      if (messageExists) return;

      set({
        messages: [...currentState.messages, newMessage],
      });

      // Move sender to top of users list when receiving message
      get().updateUserOrder(newMessage.senderId);

      // Mark as read if we're currently viewing this conversation
      if (newMessage.senderId === selectedUser._id) {
        get().markMessagesAsRead(selectedUser._id);
      }
    });
  },

  // Subscribe to global message events for unread counts and user ordering
  subscribeToGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("Global newMessage received:", newMessage);
      const currentState = get();
      const { selectedUser } = currentState;
      const authUser = useAuthStore.getState().authUser;

      const isFromCurrentUser = newMessage.senderId === authUser._id;
      const isToCurrentUser = newMessage.receiverId === authUser._id;
      const isCurrentlyViewing =
        selectedUser && selectedUser._id === newMessage.senderId;

      console.log("Message conditions:", {
        isFromCurrentUser,
        isToCurrentUser,
        isCurrentlyViewing,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        authUserId: authUser._id,
        selectedUserId: selectedUser?._id,
      });

      // Move sender to top of users list when receiving any message
      get().updateUserOrder(newMessage.senderId);

      // Only increment unread count if:
      // 1. Message is TO current user (not from current user)
      // 2. Not currently viewing this conversation
      if (isToCurrentUser && !isFromCurrentUser && !isCurrentlyViewing) {
        console.log("Incrementing unread count for:", newMessage.senderId);
        get().updateUserUnreadCount(newMessage.senderId);
      }
    });

    // Listen for messages marked as read
    socket.on("messagesMarkedAsRead", ({ userId }) => {
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? { ...user, unreadCount: 0 } : user
        ),
      }));
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
    socket.off("messagesMarkedAsRead");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
