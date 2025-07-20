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
      // Backend already sorts groups properly, so we can use them as-is
      // The backend prioritizes newly created groups at the top
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

  // Move a group to the top of the list (for newly created groups)
  moveGroupToTop: (groupId) => {
    set((state) => {
      const updatedGroups = [...state.groups];
      const groupIndex = updatedGroups.findIndex(
        (group) => group._id === groupId
      );

      if (groupIndex !== -1) {
        // Move group to top of list
        const [group] = updatedGroups.splice(groupIndex, 1);
        updatedGroups.unshift(group);
        return { groups: updatedGroups };
      }

      return state;
    });
  },

  updateGroupUnreadCount: (groupId, increment = 1) => {
    // console.log(
    //   "Updating group unread count for:",
    //   groupId,
    //   "increment:",
    //   increment
    // );
    set((state) => {
      const updatedGroups = state.groups.map((group) => {
        if (group._id === groupId) {
          const newCount = (group.unreadCount || 0) + increment;
          // console.log(
          //   `Group ${group.name}: ${group.unreadCount || 0} -> ${newCount}`
          // );
          return { ...group, unreadCount: newCount };
        }
        return group;
      });
      return { groups: updatedGroups };
    });
  },

  markGroupMessagesAsRead: async (groupId) => {
    try {
      await axiosInstance.put(`/groups/read/${groupId}`);

      // Update unread count for this group immediately
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? { ...group, unreadCount: 0 } : group
        ),
      }));
    } catch {
      // console.error("Error marking group messages as read:", error);
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/messages/${groupId}`);
      set({ groupMessages: res.data });

      // Mark group messages as read when opening conversation
      await get().markGroupMessagesAsRead(groupId);
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
      // console.log("Creating group:", {
      //   name,
      //   members,
      //   hasGroupPic: !!groupPic,
      // });
      const response = await axiosInstance.post("/groups/create", {
        name,
        members,
        groupPic,
      });
      // console.log("Group creation response:", response.data);

      // Add a fallback: refresh groups list after a short delay
      // This ensures the group appears even if socket event fails
      setTimeout(() => {
        // console.log("Refreshing groups list as fallback");
        get().getGroups();
        // Move the newly created group to top after refresh
        setTimeout(() => {
          if (response.data._id) {
            // console.log(
            //   "Moving newly created group to top after fallback refresh"
            // );
            get().moveGroupToTop(response.data._id);
          }
        }, 100);
      }, 1000);

      // Don't show toast here - let the socket event handle it
      // This prevents duplicate notifications
    } catch (error) {
      // console.error("Error creating group:", error);
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

  deleteGroupPhoto: async (groupId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/photo`);
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
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete group photo"
      );
      throw error; // Re-throw to handle in component
    }
  },

  deleteGroup: async (groupId) => {
    try {
      // console.log("Deleting group:", groupId);
      await axiosInstance.delete(`/groups/${groupId}`);

      // Remove group from local state
      set((state) => {
        const updatedGroups = state.groups.filter((g) => g._id !== groupId);
        // If the deleted group is selected, clear selection
        const selectedGroup =
          state.selectedGroup && state.selectedGroup._id === groupId
            ? null
            : state.selectedGroup;
        return { groups: updatedGroups, selectedGroup };
      });

      // Don't show toast here - let the socket event handle it
      // This prevents duplicate notifications
    } catch (error) {
      // console.error("Error deleting group:", error);
      toast.error(error.response?.data?.message || "Failed to delete group");
      throw error; // Re-throw to handle in component
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
      // Notification handled by socket event to avoid duplicates
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
      // Notification handled by socket event to avoid duplicates
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

      // Avoid duplicate messages
      const currentState = get();
      const messageExists = currentState.groupMessages.some(
        (msg) => msg._id === newMessage._id
      );
      if (messageExists) return;

      set({
        groupMessages: [...currentState.groupMessages, newMessage],
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

      // Notification handled by global subscription to avoid duplicates
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

      // Notification handled by global subscription to avoid duplicates
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

      // Notification handled by global subscription to avoid duplicates
    });
  },

  // Subscribe to global group events (not tied to selected group)
  subscribeToGlobalGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      // console.log("Socket not available for group events subscription");
      return;
    }

    // Prevent multiple subscriptions
    const { isGlobalEventsSubscribed } = get();
    if (isGlobalEventsSubscribed) {
      // console.log("Global group events already subscribed");
      return;
    }

    // console.log("Subscribing to global group events");
    set({ isGlobalEventsSubscribed: true });

    // Listen for new group creation (when user is added to a new group)
    socket.on("groupCreated", (data) => {
      // console.log("groupCreated event received:", data);
      set((state) => {
        // Check if group already exists in the list
        const groupExists = state.groups.some((g) => g._id === data.group._id);
        if (groupExists) {
          // console.log("Group already exists in list, moving to top");
          // Move existing group to top
          get().moveGroupToTop(data.group._id);
          return state;
        }

        // console.log("Adding new group to top of list:", data.group.name);
        return {
          groups: [data.group, ...state.groups], // Add to top instead of bottom
        };
      });

      // Show different messages based on who created the group
      const authUser = useAuthStore.getState().authUser;
      if (data.addedBy === authUser._id) {
        toast.success(`Group "${data.group.name}" created successfully!`);
      } else {
        toast.success(`You've been added to "${data.group.name}"!`);
      }
    });

    // Listen for member additions to any group (for users not currently viewing that group)
    socket.on("groupMemberAdded", (data) => {
      // console.log("groupMemberAdded event received:", data);

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
      // console.log("Group existed check:", {
      //   groupExisted,
      //   groupId: data.groupId,
      // });
      if (groupExisted) {
        // console.log(
        //   "Showing member addition notification for:",
        //   data.group.name
        // );
        toast.success(`New member added to ${data.group.name}!`);
      }
    });

    // Listen for member removals from any group
    socket.on("groupMemberRemoved", (data) => {
      // console.log("groupMemberRemoved event received:", data);

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

      // Show notification for member removal
      // console.log("Showing member removal notification for:", data.group.name);
      toast.success(`Member removed from ${data.group.name}!`);
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

      // Show notification for group info updates
      toast.success(`${data.group.name} updated!`);
    });

    // Listen for new group messages for unread counts
    socket.on("newGroupMessage", (newMessage) => {
      // console.log("Global newGroupMessage received:", newMessage);
      const currentState = get();
      const { selectedGroup } = currentState;
      const authUser = useAuthStore.getState().authUser;

      const isFromCurrentUser = newMessage.senderId === authUser._id;
      const isCurrentlyViewing =
        selectedGroup && selectedGroup._id === newMessage.groupId;

      // console.log("Group message conditions:", {
      //   isFromCurrentUser,
      //   isCurrentlyViewing,
      //   senderId: newMessage.senderId,
      //   groupId: newMessage.groupId,
      //   authUserId: authUser._id,
      //   selectedGroupId: selectedGroup?._id,
      // });

      // Move group to top of list when receiving any message
      get().updateGroupOrder(newMessage.groupId);

      // Only increment unread count if:
      // 1. Not from current user
      // 2. Not currently viewing this group
      if (!isFromCurrentUser && !isCurrentlyViewing) {
        // console.log("Incrementing group unread count for:", newMessage.groupId);
        get().updateGroupUnreadCount(newMessage.groupId);
      }
    });

    // Listen for group messages marked as read
    socket.on("groupMessagesMarkedAsRead", ({ groupId }) => {
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? { ...group, unreadCount: 0 } : group
        ),
      }));
    });

    // Listen for group deletion
    socket.on("groupDeleted", (data) => {
      // console.log("groupDeleted event received:", data);
      set((state) => {
        const updatedGroups = state.groups.filter(
          (group) => group._id !== data.groupId
        );
        const updatedSelectedGroup =
          state.selectedGroup && state.selectedGroup._id === data.groupId
            ? null
            : state.selectedGroup;
        return { groups: updatedGroups, selectedGroup: updatedSelectedGroup };
      });

      // Show different messages based on who deleted the group
      const authUser = useAuthStore.getState().authUser;
      if (data.deletedBy === authUser._id) {
        toast.success("Group deleted successfully!");
      } else {
        toast.success(`"${data.groupName}" group has been deleted`);
      }
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
    socket.off("newGroupMessage");
    socket.off("groupMessagesMarkedAsRead");
    socket.off("groupDeleted");

    set({ isGlobalEventsSubscribed: false });
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },
}));
