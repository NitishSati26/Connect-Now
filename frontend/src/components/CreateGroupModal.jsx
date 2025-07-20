import { useState, useRef } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Users, Image, Plus, Check, User } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
  const { createGroup } = useGroupStore();
  const { users } = useChatStore();
  const { authUser } = useAuthStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPic, setGroupPic] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const handleMemberChange = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGroupPic(e.target.files[0]);
    }
  };

  const handleRemovePic = () => {
    setGroupPic(null);
    // Clear the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setIsCreating(true);
    let base64Pic = null;
    if (groupPic) {
      base64Pic = await toBase64(groupPic);
    }
    await createGroup({
      name: groupName,
      members: selectedMembers,
      groupPic: base64Pic,
    });
    setIsCreating(false);
    setGroupName("");
    setSelectedMembers([]);
    setGroupPic(null);
    if (onClose) onClose();
  };

  // Helper to convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Exclude self from user list and filter by search term
  const availableUsers = users
    .filter((u) => u._id !== authUser._id)
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden relative h-[600px] flex flex-col border border-base-300">
        {/* Floating close icon */}
        <button
          className="absolute top-4 right-4 text-base-content/50 hover:text-primary z-10"
          onClick={onClose}
          title="Close"
          disabled={isCreating}
        >
          <X size={26} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 px-6 py-6 flex flex-col items-center relative">
          <div className="relative mb-2">
            {groupPic ? (
              <img
                src={URL.createObjectURL(groupPic)}
                alt="Group preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-base-100/20 rounded-full border-4 border-base-100 shadow-lg flex items-center justify-center">
                <Users className="size-12 text-base-100" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <label className="bg-base-100 rounded-full p-1 shadow cursor-pointer hover:bg-base-200 transition">
                <Image size={18} className="text-primary" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePicChange}
                  className="hidden"
                  disabled={isCreating}
                />
              </label>
              {groupPic && (
                <button
                  onClick={handleRemovePic}
                  className="bg-base-100 rounded-full p-1 shadow cursor-pointer hover:bg-error/10 hover:text-error transition"
                  disabled={isCreating}
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center mt-2">
            <input
              className="input input-bordered text-lg font-semibold bg-base-100/90 border-base-100"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <span className="text-white text-sm mt-1 opacity-80">
            {selectedMembers.length} member
            {selectedMembers.length === 1 ? "" : "s"} selected
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Member Selection */}
          <div>
            <h3 className="font-semibold mb-3 text-base-content">
              Add Members ({selectedMembers.length} selected)
            </h3>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="text"
                className="input input-bordered w-full pl-9"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isCreating}
              />
              <Users className="size-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* User List */}
            <div className="border border-base-300 rounded-lg max-h-60 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="p-4 text-center text-base-content/50 text-sm">
                  {searchTerm ? "No users found" : "No users available"}
                </div>
              ) : (
                <ul className="divide-y divide-base-300">
                  {availableUsers.map((user) => {
                    const isSelected = selectedMembers.includes(user._id);
                    return (
                      <li
                        key={user._id}
                        className={`flex items-center px-3 py-2 hover:bg-base-200 transition ${
                          isSelected ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="relative">
                          <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="size-4 text-primary" />
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="size-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 ml-3">
                          <div className="font-medium text-sm text-base-content">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {isSelected ? "Selected" : "Click to select"}
                          </div>
                        </div>
                        {isSelected ? (
                          <button
                            onClick={() => handleMemberChange(user._id)}
                            className="btn btn-xs btn-error ml-2 hover:scale-105 transition"
                            disabled={isCreating}
                            title="Remove member"
                          >
                            <X size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMemberChange(user._id)}
                            className="btn btn-xs btn-primary ml-2 hover:scale-105 transition"
                            disabled={isCreating}
                            title="Add member"
                          >
                            Add
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-base-300 bg-base-200 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="btn btn-primary flex-1"
              disabled={
                isCreating || !groupName.trim() || selectedMembers.length === 0
              }
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-2" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
