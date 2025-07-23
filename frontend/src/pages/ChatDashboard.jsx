import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const ChatDashboard = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const hasActiveChat = selectedUser || selectedGroup;

  // Check if screen is mobile (including tablets)
  useEffect(() => {
    const checkMobile = () => {
      // Consider mobile if width is less than 1024px (lg breakpoint)
      // This covers phones, tablets in portrait mode, and smaller laptops
      const isMobileDevice = window.innerWidth < 1024;

      // Also check for touch capability and user agent
      const hasTouchScreen =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      setIsMobile(isMobileDevice || (hasTouchScreen && isMobileUserAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  // Show chat when user/group is selected on mobile
  useEffect(() => {
    if (hasActiveChat && isMobile) {
      setShowChat(true);
    }
  }, [hasActiveChat, isMobile]);

  // Handle back button for mobile
  const handleBackToSidebar = () => {
    setShowChat(false);
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  return (
    <div className="h-screen bg-base-200 pt-16">
      <div className="h-full w-full">
        <div className="bg-base-100 h-full">
          <div className="flex h-full">
            {/* Sidebar - takes full width on mobile when no chat, or side-by-side on desktop */}
            <div
              className={`${
                isMobile && showChat ? "hidden" : "block"
              } lg:block ${isMobile && !showChat ? "w-full flex-1" : ""}`}
            >
              <Sidebar />
            </div>

            {/* Chat Container or No Chat Selected - only show on desktop when no chat is active */}
            <div
              className={`${
                isMobile && !showChat ? "hidden" : "block"
              } lg:block flex-1 min-w-0 overflow-hidden`}
            >
              {hasActiveChat ? (
                <ChatContainer onBack={handleBackToSidebar} />
              ) : (
                <NoChatSelected />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
