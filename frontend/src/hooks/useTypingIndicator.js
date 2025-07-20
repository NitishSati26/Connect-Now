import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

export const useTypingIndicator = (chatType, chatId, currentUserId) => {
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const socket = useAuthStore((state) => state.socket);
  const typingTimeoutRef = useRef(null);

  // Handle incoming typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ senderId, senderName }) => {
      if (senderId !== currentUserId) {
        setTypingUsers((prev) => new Set([...prev, senderName]));
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (senderId !== currentUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          // Remove user by finding their name (we'll need to get this from context)
          // For now, we'll clear all typing indicators
          newSet.clear();
          return newSet;
        });
      }
    };

    const handleGroupUserTyping = ({ senderId, senderName }) => {
      if (senderId !== currentUserId) {
        setTypingUsers((prev) => new Set([...prev, senderName]));
      }
    };

    const handleGroupUserStopTyping = ({ senderId }) => {
      if (senderId !== currentUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          // Remove user by finding their name
          newSet.clear();
          return newSet;
        });
      }
    };

    // Listen for typing events
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);
    socket.on("groupUserTyping", handleGroupUserTyping);
    socket.on("groupUserStopTyping", handleGroupUserStopTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      socket.off("groupUserTyping", handleGroupUserTyping);
      socket.off("groupUserStopTyping", handleGroupUserStopTyping);
    };
  }, [socket, currentUserId, chatId]);

  // Send typing indicator
  const sendTypingIndicator = (senderName) => {
    if (!socket || !chatId) return;

    setIsTyping(true);

    if (chatType === "private") {
      socket.emit("typing", {
        receiverId: chatId,
        senderId: currentUserId,
        senderName,
      });
    } else if (chatType === "group") {
      socket.emit("groupTyping", {
        groupId: chatId,
        senderId: currentUserId,
        senderName,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingIndicator();
    }, 2000); // Stop typing indicator after 2 seconds of inactivity
  };

  // Send stop typing indicator
  const sendStopTypingIndicator = () => {
    if (!socket || !chatId || !isTyping) return;

    setIsTyping(false);

    if (chatType === "private") {
      socket.emit("stopTyping", {
        receiverId: chatId,
        senderId: currentUserId,
      });
    } else if (chatType === "group") {
      socket.emit("groupStopTyping", {
        groupId: chatId,
        senderId: currentUserId,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    isTyping,
    sendTypingIndicator,
    sendStopTypingIndicator,
  };
};
