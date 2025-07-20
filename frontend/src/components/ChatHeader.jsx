import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const ChatHeader = ({ onBack }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setSelectedGroup } = useGroupStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {selectedUser?.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300 text-base-content rounded-full flex items-center justify-center text-lg font-semibold">
                  {selectedUser?.fullName?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Back button for mobile, Close button for desktop */}
        <div className="flex items-center gap-2">
          {/* Back button - only show on mobile */}
          {onBack && (
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors lg:hidden"
              onClick={onBack}
              title="Back to Chats"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Close button - only show on desktop */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors hidden lg:block p-0 border-0 relative"
            onClick={() => {
              setSelectedUser(null);
              // Also clear selected group to be consistent with sidebar behavior
              setSelectedGroup(null);
            }}
            title="Close Chat"
          >
            <X size={18} className="absolute inset-0 m-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
