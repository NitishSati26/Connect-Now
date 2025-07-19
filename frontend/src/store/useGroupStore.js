// src/store/useGroupStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [], // All groups the user is in
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isGlobalEventsSubscribed: false, // Flag to prevent multiple subscriptions

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  updateGroupOrder: (groupId) => {
    set((state) => {
      const updatedGroups = [...state.groups];
      const groupIndex = updatedGroups.findIndex(
        (group) => group._id === groupId
      );

      if (groupIndex > 0) {
        // Move group to top of list
        const [group] = updatedGroups.splice(groupIndex, 1);
        updatedGroups.unshift(group);
      }

      return { groups: updatedGroups };
    });
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/messages/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { groupMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/groups/send/${groupId}`,
        messageData
      );
      set({ groupMessages: [...groupMessages, res.data] });

      // Move current group to top of list when sending message
      get().updateGroupOrder(groupId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  createGroup: async ({ name, members, groupPic }) => {
    set({ isGroupsLoading: true });
    try {
      await axiosInstance.post("/groups/create", {
        name,
        members,
        groupPic,
      });
      // Don't add to groups list here - let the socket event handle it
      toast.success("Group created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  updateGroupInfo: async (groupId, { name, groupPic }) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, {
        name,
        groupPic,
      });
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === groupId ? res.data : g
        );
        // If the updated group is selected, update selectedGroup too
        const selectedGroup =
          state.selectedGroup && state.selectedGroup._id === groupId
            ? res.data
            : state.selectedGroup;
        return { groups: updatedGroups, selectedGroup };
      });
      toast.success("Group updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  addMemberToGroup: async (groupId, userId) => {
    try {
      const res = await axiosInstance.put(`/groups/add-member/${groupId}`, {
        userId,
      });
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === groupId ? res.data : g
        );
        const selectedGroup =
          state.selectedGroup && state.selectedGroup._id === groupId
            ? res.data
            : state.selectedGroup;
        return { groups: updatedGroups, selectedGroup };
      });
      toast.success("Member added!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  },

  removeMemberFromGroup: async (groupId, userId) => {
    try {
      const res = await axiosInstance.put(`/groups/remove-member/${groupId}`, {
        userId,
      });
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === groupId ? res.data : g
        );
        const selectedGroup =
          state.selectedGroup && state.selectedGroup._id === groupId
            ? res.data
            : state.selectedGroup;
        return { groups: updatedGroups, selectedGroup };
      });
      toast.success("Member removed!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedGroup || !socket) return;

    // Listen for new group messages
    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId !== selectedGroup._id) return;
      set({
        groupMessages: [...get().groupMessages, newMessage],
      });

      // Move group to top of list when receiving message
      get().updateGroupOrder(newMessage.groupId);
    });

    // Listen for member additions
    socket.on("groupMemberAdded", (data) => {
      if (data.groupId !== selectedGroup._id) return;

      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );
        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });

      toast.success(`New member added to ${data.group.name}!`);
    });

    // Listen for member removals
    socket.on("groupMemberRemoved", (data) => {
      if (data.groupId !== selectedGroup._id) return;

      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );
        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });

      toast.success(`Member removed from ${data.group.name}!`);
    });

    // Listen for group info updates
    socket.on("groupInfoUpdated", (data) => {
      if (data.groupId !== selectedGroup._id) return;

      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );
        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });

      toast.success(`${data.group.name} updated!`);
    });
  },

  // Subscribe to global group events (not tied to selected group)
  subscribeToGlobalGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Prevent multiple subscriptions
    const { isGlobalEventsSubscribed } = get();
    if (isGlobalEventsSubscribed) return;

    set({ isGlobalEventsSubscribed: true });

    // Listen for new group creation (when user is added to a new group)
    socket.on("groupCreated", (data) => {
      set((state) => {
        // Check if group already exists in the list
        const groupExists = state.groups.some((g) => g._id === data.group._id);
        if (groupExists) return state;

        return {
          groups: [...state.groups, data.group],
        };
      });

      toast.success(`You've been added to ${data.group.name}!`);
    });

    // Listen for member additions to any group (for users not currently viewing that group)
    socket.on("groupMemberAdded", (data) => {
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );

        // Only update selectedGroup if it's the current group
        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });

      // Only show notification if this is not a new group (check if group already existed)
      const currentState = get();
      const groupExisted = currentState.groups.some(
        (g) => g._id === data.groupId
      );
      if (groupExisted) {
        toast.success(`New member added to ${data.group.name}!`);
      }
    });

    // Listen for member removals from any group
    socket.on("groupMemberRemoved", (data) => {
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );

        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });
    });

    // Listen for group info updates to any group
    socket.on("groupInfoUpdated", (data) => {
      set((state) => {
        const updatedGroups = state.groups.map((g) =>
          g._id === data.groupId ? data.group : g
        );

        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? data.group
            : state.selectedGroup;

        return {
          groups: updatedGroups,
          selectedGroup: updatedSelectedGroup,
        };
      });
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupMemberAdded");
    socket.off("groupMemberRemoved");
    socket.off("groupInfoUpdated");
  },

  unsubscribeFromGlobalGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("groupCreated");
    socket.off("groupMemberAdded");
    socket.off("groupMemberRemoved");
    socket.off("groupInfoUpdated");

    set({ isGlobalEventsSubscribed: false });
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },
}));
