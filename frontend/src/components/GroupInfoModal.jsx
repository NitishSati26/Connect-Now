import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Pencil, UserPlus, X, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const GroupInfoModal = ({ onClose }) => {
  const {
    selectedGroup,
    updateGroupInfo,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroupPhoto,
    deleteGroup,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const isAdmin = selectedGroup?.admin === authUser._id;

  const [editName, setEditName] = useState(false);
  const [groupName, setGroupName] = useState(selectedGroup?.name || "");
  const [picFile, setPicFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(""); // userId being removed
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState("");

  // Ensure modal always shows the latest group image after update
  useEffect(() => {
    setPicFile(null);
  }, [selectedGroup.groupPic]);

  const handleSave = async () => {
    setIsSaving(true);
    let base64Pic = selectedGroup?.groupPic;
    if (picFile) {
      base64Pic = await toBase64(picFile);
      // console.log("Base64 image length:", base64Pic.length);
    }
    // console.log("Updating group with:", {
    //   name: groupName,
    //   groupPic: base64Pic,
    // });
    await updateGroupInfo(selectedGroup._id, {
      name: groupName,
      groupPic: base64Pic,
    });
    setEditName(false);
    setIsSaving(false);
    setPicFile(null);
  };

  // Helper to convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Remove member logic
  const handleRemoveMember = async (userId) => {
    setIsRemoving(userId);
    await removeMemberFromGroup(selectedGroup._id, userId);
    setIsRemoving("");
  };

  // Users not in the group
  const groupMemberIds = selectedGroup?.members?.map((m) => m._id) || [];
  const availableUsers = users.filter(
    (u) => !groupMemberIds.includes(u._id) && u._id !== authUser._id
  );
  const filteredUsers = availableUsers.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const nameChanged = groupName !== selectedGroup?.name;
  const picChanged = !!picFile;
  const canSave = (nameChanged || picChanged) && !isSaving;

  // Add member logic (from modal)
  const handleAddMember = async (userId) => {
    setIsAdding(true);
    await addMemberToGroup(selectedGroup._id, userId);
    setIsAdding(false);
    setShowAddModal(false);
    setSearch("");
  };

  // Delete group photo logic
  const handleDeletePhoto = async () => {
    if (!selectedGroup?.groupPic) return;

    setIsDeletingPhoto(true);
    try {
      await deleteGroupPhoto(selectedGroup._id);
      toast.success("Group photo deleted successfully!");
    } catch {
      toast.error("Failed to delete group photo");
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // Delete group logic
  const handleDeleteGroup = async () => {
    setIsDeletingGroup(true);
    try {
      await deleteGroup(selectedGroup._id);
      setShowDeleteModal(false);
      onClose(); // Close the modal after successful deletion
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden relative border border-base-300">
      {/* Floating close icon */}
      <button
        className="absolute top-4 right-4 text-base-content/50 hover:text-primary z-10"
        onClick={onClose}
        title="Close"
      >
        <X size={26} />
      </button>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-500 px-6 py-6 flex flex-col items-center relative">
        <div className="relative mb-2">
          <img
            src={
              picFile
                ? URL.createObjectURL(picFile)
                : selectedGroup?.groupPic || "/avatar.png"
            }
            alt="Group"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          {isAdmin && (
            <>
              <label className="absolute bottom-2 right-2 bg-base-100 rounded-full p-1 shadow cursor-pointer hover:bg-base-200 transition">
                <Pencil size={18} className="text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPicFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {/* Delete photo button - only show if group has a photo and no new photo is selected */}
              {selectedGroup?.groupPic && !picFile && (
                <button
                  onClick={handleDeletePhoto}
                  disabled={isDeletingPhoto}
                  className="absolute top-2 right-2 bg-error hover:bg-error/80 text-error-content rounded-full p-1 shadow cursor-pointer transition-colors disabled:opacity-50"
                  title="Delete group photo"
                >
                  {isDeletingPhoto ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </>
          )}
        </div>
        {/* Save button for image update */}
        {isAdmin && picFile && !editName && (
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Image"}
          </button>
        )}
        {editName ? (
          <div className="flex gap-2 items-center mt-2">
            <input
              className="input input-bordered text-lg font-semibold"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={!canSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-sm" onClick={() => setEditName(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center mt-2">
            <span className="text-2xl font-bold text-white drop-shadow">
              {groupName}
            </span>
            {isAdmin && (
              <button
                className="btn btn-xs btn-circle bg-base-100 text-primary border-none shadow hover:bg-base-200"
                onClick={() => setEditName(true)}
                title="Edit group name"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        )}
        <span className="text-white text-sm mt-1 opacity-80">
          {selectedGroup?.members?.length} member
          {selectedGroup?.members?.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Members List */}
      <div className="px-6 py-4">
        <h3 className="font-semibold mb-3 text-base-content">Members</h3>
        <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
          {selectedGroup?.members?.map((member) => (
            <li
              key={member._id}
              className="flex items-center bg-base-100 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition"
            >
              <img
                src={member.profilePic || "/avatar.png"}
                alt={member.fullName}
                className="w-9 h-9 rounded-full object-cover border mr-3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-base-content">
                  {member.fullName}
                  {selectedGroup.admin === member._id && (
                    <span className="ml-2 text-xs bg-primary text-primary-content rounded px-2 py-0.5">
                      admin
                    </span>
                  )}
                </div>
                <div className="text-xs text-base-content/60 truncate">
                  {member.email}
                </div>
              </div>
              {isAdmin && member._id !== authUser._id && (
                <button
                  className="btn btn-xs btn-error ml-2 hover:scale-105 transition"
                  onClick={() => handleRemoveMember(member._id)}
                  disabled={isRemoving === member._id}
                  title="Remove member"
                >
                  {isRemoving === member._id ? "..." : <X size={16} />}
                </button>
              )}
            </li>
          ))}
        </ul>
        {isAdmin && (
          <button
            className="btn btn-outline btn-primary w-full flex items-center justify-center gap-2 mb-2 rounded-lg"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={18} /> Add Member
          </button>
        )}

        {/* Delete Group Section - Admin Only */}
        {isAdmin && (
          <div className="border-t border-base-300 pt-4 mt-4">
            <h3 className="font-semibold mb-3 text-error">Danger Zone</h3>
            <button
              className="btn btn-error w-full flex items-center justify-center gap-2"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} /> Delete Group
            </button>
            <p className="text-xs text-base-content/60 mt-2 text-center">
              This action cannot be undone. All messages and members will be
              permanently removed.
            </p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-xs p-6 relative border border-base-300">
            <button
              className="absolute top-3 right-3 text-base-content/50 hover:text-primary"
              onClick={() => setShowAddModal(false)}
              title="Close"
            >
              <X size={22} />
            </button>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <UserPlus size={20} /> Add Member
            </h4>
            <div className="mb-3 relative">
              <input
                className="input input-bordered w-full pl-9"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                className="absolute left-2 top-2.5 text-base-content/40"
                size={18}
              />
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-base-300">
              {filteredUsers.length === 0 && (
                <li className="text-base-content/50 text-sm py-2 text-center">
                  No users found
                </li>
              )}
              {filteredUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center gap-2 py-2 px-1 hover:bg-base-200 rounded cursor-pointer transition"
                  onClick={() => handleAddMember(user._id)}
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="flex-1 truncate">{user.fullName}</span>
                  {isAdding ? (
                    <span className="text-xs text-primary">Adding...</span>
                  ) : (
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMember(user._id);
                      }}
                    >
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-md p-6 relative border border-base-300">
            <button
              className="absolute top-3 right-3 text-base-content/50 hover:text-primary"
              onClick={() => setShowDeleteModal(false)}
              title="Close"
            >
              <X size={22} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-error" />
              </div>
              <h3 className="text-lg font-bold mb-2">Delete Group</h3>
              <p className="text-base-content/70 mb-6">
                Are you sure you want to delete{" "}
                <strong>&ldquo;{selectedGroup?.name}&rdquo;</strong>? This
                action cannot be undone and will permanently remove all messages
                and members.
              </p>
              <div className="flex gap-3">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingGroup}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error flex-1"
                  onClick={handleDeleteGroup}
                  disabled={isDeletingGroup}
                >
                  {isDeletingGroup ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoModal;
