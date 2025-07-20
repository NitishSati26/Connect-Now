import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const ChatHeader = () => {
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
                <div className="w-full h-full bg-zinc-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
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

        {/* Close button */}
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => {
            setSelectedUser(null);
            // Also clear selected group to be consistent with sidebar behavior
            setSelectedGroup(null);
          }}
          title="Close Chat"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
