import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UsersRound, MessageCircle, Plus, Search } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const {
    groups,
    selectedGroup,
    setSelectedGroup,
    getGroups,
    isGroupsLoading,
    subscribeToGlobalGroupEvents,
    unsubscribeFromGlobalGroupEvents,
  } = useGroupStore();

  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [tab, setTab] = useState("private"); // "private" or "groups"
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();

    // Subscribe to global group events for real-time updates
    subscribeToGlobalGroupEvents();

    return () => {
      unsubscribeFromGlobalGroupEvents();
    };
  }, [
    getUsers,
    getGroups,
    subscribeToGlobalGroupEvents,
    unsubscribeFromGlobalGroupEvents,
  ]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const filteredUsersBySearch = filteredUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupsBySearch = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = tab === "private" ? isUsersLoading : isGroupsLoading;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null); // clear group selection
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null); // clear private selection
  };

  return (
    <aside className="h-full w-full lg:w-80 border-r border-base-300 flex flex-col bg-base-100 transition-all duration-300 min-w-0">
      {/* Header */}
      <div className="border-b border-base-300 p-3 md:p-4 bg-base-200/50 min-w-0">
        {/* Tab Toggle */}
        <div className="flex items-center justify-center mb-3 md:mb-4">
          {/* Professional Tab Toggle */}
          <div className="flex bg-base-300 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setTab("private")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                tab === "private"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content hover:text-primary hover:bg-base-200"
              }`}
            >
              <MessageCircle className="size-3 md:size-4" />
              <span className="hidden sm:block">Chats</span>
            </button>
            <button
              onClick={() => setTab("groups")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                tab === "groups"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content hover:text-primary hover:bg-base-200"
              }`}
            >
              <UsersRound className="size-3 md:size-4" />
              <span className="hidden sm:block">Groups</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-3 md:size-4 text-base-content/50" />
          <input
            type="text"
            placeholder={`Search ${tab === "private" ? "users" : "groups"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 bg-base-200 border border-base-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between min-w-0">
          {/* Online Filter (only for private) */}
          {tab === "private" && (
            <label className="cursor-pointer flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-xs md:checkbox-sm checkbox-primary"
              />
              <span className="text-base-content/70 truncate">Online only</span>
              <span className="text-xs text-base-content/50 bg-base-300 px-1 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                {onlineUsers.length - 1}
              </span>
            </label>
          )}

          {/* Create Group Button (only for groups tab) */}
          {tab === "groups" && (
            <button
              className="btn btn-xs md:btn-sm btn-primary gap-1 md:gap-2"
              onClick={() => setShowCreateGroupModal(true)}
            >
              <Plus className="size-3 md:size-4" />
              <span className="hidden sm:block">Create Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden min-w-0">
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Private Chats */}
            {tab === "private" && (
              <div className="p-1 md:p-2">
                {filteredUsersBySearch.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="size-12 text-base-content/30 mx-auto mb-3" />
                    <p className="text-base-content/50 text-sm">
                      {searchQuery ? "No users found" : "No users available"}
                    </p>
                  </div>
                ) : (
                  filteredUsersBySearch.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full p-2 md:p-3 flex items-center gap-2 md:gap-3 rounded-xl hover:bg-base-200 transition-all duration-200 group relative min-w-0 ${
                        selectedUser?._id === user._id
                          ? "bg-primary/10 border border-primary/20 shadow-sm"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          key={`${user._id}-${user.profilePic}-${user.updatedAt}`}
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="size-10 md:size-12 object-cover rounded-full border-2 border-base-300 group-hover:border-primary/30 transition-colors duration-200"
                        />

                        {/* Unread Badge */}
                        {user.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center px-1 font-medium shadow-sm">
                            {user.unreadCount > 3 ? "3+" : user.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-semibold text-base-content truncate text-sm md:text-base">
                          {user.fullName}
                        </div>
                        <div className="text-xs md:text-sm text-base-content/60 flex items-center gap-1">
                          <div
                            className={`size-1.5 md:size-2 rounded-full ${
                              onlineUsers.includes(user._id)
                                ? "bg-success"
                                : "bg-base-content/30"
                            }`}
                          ></div>
                          <span className="truncate">
                            {onlineUsers.includes(user._id)
                              ? "Online"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Groups */}
            {tab === "groups" && (
              <div className="p-1 md:p-2">
                {filteredGroupsBySearch.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersRound className="size-12 text-base-content/30 mx-auto mb-3" />
                    <p className="text-base-content/50 text-sm">
                      {searchQuery ? "No groups found" : "No groups available"}
                    </p>
                  </div>
                ) : (
                  filteredGroupsBySearch.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full p-2 md:p-3 flex items-center gap-2 md:gap-3 rounded-xl hover:bg-base-200 transition-all duration-200 group min-w-0 ${
                        selectedGroup?._id === group._id
                          ? "bg-primary/10 border border-primary/20 shadow-sm"
                          : ""
                      }`}
                    >
                      {/* Group Avatar */}
                      <div className="relative flex-shrink-0">
                        {group.groupPic ? (
                          <img
                            src={
                              group.groupPic +
                              (group.updatedAt
                                ? `?t=${new Date(group.updatedAt).getTime()}`
                                : "")
                            }
                            alt={group.name}
                            className="size-10 md:size-12 object-cover rounded-full border-2 border-base-300 group-hover:border-primary/30 transition-colors duration-200"
                          />
                        ) : (
                          <div className="size-10 md:size-12 bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full flex items-center justify-center text-lg md:text-xl font-bold border-2 border-base-300 group-hover:border-primary/30 transition-colors duration-200">
                            {group.name[0].toUpperCase()}
                          </div>
                        )}

                        {/* Unread Badge */}
                        {group.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center px-1 font-medium shadow-sm">
                            {group.unreadCount > 3 ? "3+" : group.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-semibold text-base-content truncate text-sm md:text-base">
                          {group.name}
                        </div>
                        <div className="text-xs md:text-sm text-base-content/60 flex items-center gap-1">
                          <Users className="size-2.5 md:size-3" />
                          <span className="truncate">
                            {group.members.length} members
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-2xl p-6 relative w-full max-w-md mx-4">
            <button
              className="absolute top-4 right-4 text-base-content/50 hover:text-base-content transition-colors"
              onClick={() => setShowCreateGroupModal(false)}
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
