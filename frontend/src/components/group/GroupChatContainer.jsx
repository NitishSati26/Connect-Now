import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useChatStore } from "../../store/useChatStore";
import { formatDistanceToNow } from "date-fns";
import GroupInfoModal from "../GroupInfoModal";
import {
  Info,
  X,
  Send,
  Image,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import toast from "react-hot-toast";
import { useTypingIndicator } from "../../hooks/useTypingIndicator";
import TypingIndicator from "../TypingIndicator";
import ImageModal from "../ImageModal";

const GroupChatContainer = ({ onBack }) => {
  const {
    selectedGroup,
    groupMessages,
    isGroupMessagesLoading,
    getGroupMessages,
    sendGroupMessage,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    setSelectedGroup,
    deleteGroup,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const [messageText, setMessageText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Typing indicator hook
  const { typingUsers, sendTypingIndicator, sendStopTypingIndicator } =
    useTypingIndicator("group", selectedGroup?._id, authUser?._id);

  // Voice to text
  const { isListening, startListening, stopListening } = useSpeechRecognition(
    (transcript) => {
      setMessageText((prev) => (prev ? prev + " " + transcript : transcript));
    }
  );

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
    }

    return () => {
      unsubscribeFromGroupMessages();
    };
  }, [selectedGroup]);

  useEffect(() => {
    if (scrollRef.current && (groupMessages || typingUsers.length > 0)) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
    }
  }, [groupMessages, typingUsers]);

  // Scroll to bottom when group chat is first opened
  useEffect(() => {
    if (selectedGroup && scrollRef.current) {
      // Use a longer timeout for initial load to ensure messages are rendered
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 200);
    }
  }, [selectedGroup]);

  const handleFileSelect = (type) => {
    setShowFileMenu(false);

    if (type === "image") {
      fileInputRef.current?.click();
    } else if (type === "document") {
      docInputRef.current?.click();
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
    } else if (type === "document") {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a document file (PDF, DOC, DOCX, TXT)");
        return;
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        name: file.name,
        type: type,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  // Theme-aware bubble colors
  const getBubbleClasses = (isCurrentUser) => {
    const baseClasses =
      "chat-bubble flex flex-col max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg";

    if (isCurrentUser) {
      // Current user messages - use primary color with theme awareness
      return `${baseClasses} bg-primary text-primary-content rounded-2xl rounded-br-md`;
    } else {
      // Other user messages - use theme-aware neutral colors
      const isDarkTheme = [
        "coffee",
        "night",
        "dim",
        "sunset",
        "forest",
        "aqua",
        "synthwave",
        "halloween",
        "cyberpunk",
        "valentine",
        "dracula",
        "nord",
        "lofi",
      ].includes(theme);

      if (isDarkTheme) {
        return `${baseClasses} bg-base-200 text-base-content border border-base-300 rounded-2xl rounded-bl-md`;
      } else {
        return `${baseClasses} bg-base-300 text-base-content rounded-2xl rounded-bl-md`;
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !filePreview) return;
    if (isSending) return; // Prevent multiple submissions

    setIsSending(true);
    try {
      const messageData = {};

      // Only add text if it's not empty
      if (messageText.trim()) {
        messageData.text = messageText.trim();
      }

      if (filePreview?.type === "image") {
        messageData.image = filePreview.url;
      } else if (filePreview?.type === "document") {
        messageData.document = filePreview.url;
        messageData.documentName = filePreview.name;
      }

      // console.log("Sending group message data:", messageData);
      await sendGroupMessage(selectedGroup._id, messageData);

      setMessageText("");
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Check if current user is admin
  const isAdmin = selectedGroup?.admin === authUser._id;

  // Delete group handler
  const handleDeleteGroup = async () => {
    setIsDeletingGroup(true);
    try {
      await deleteGroup(selectedGroup._id);
      setShowDeleteModal(false);
      // Group will be removed from state automatically via socket event
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                {selectedGroup?.groupPic ? (
                  <img
                    src={selectedGroup.groupPic}
                    alt={selectedGroup.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-base-300 text-base-content rounded-full flex items-center justify-center text-lg font-semibold">
                    {selectedGroup?.name?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Group info */}
            <div>
              <h3 className="font-medium">{selectedGroup?.name}</h3>
              <p className="text-sm text-base-content/70">
                {selectedGroup?.members?.length} members
              </p>
            </div>
          </div>

          {/* Group Info, Back button for mobile, and Close button for desktop */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors"
              onClick={() => setShowGroupInfo(true)}
              title="Group Info"
            >
              <Info size={18} />
            </button>

            {/* Delete Group button - Admin only */}
            {isAdmin && (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-error/10 text-error transition-colors"
                onClick={() => setShowDeleteModal(true)}
                title="Delete Group"
              >
                <Trash2 size={18} />
              </button>
            )}

            {/* Back button - only show on mobile */}
            {onBack && (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors lg:hidden"
                onClick={onBack}
                title="Back to Groups"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            {/* Close button - only show on desktop */}
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors hidden lg:block p-0 border-0 relative"
              onClick={() => {
                setSelectedGroup(null);
                // Also clear selected user to be consistent with sidebar behavior
                const { setSelectedUser } = useChatStore.getState();
                setSelectedUser(null);
              }}
              title="Close Chat"
            >
              <X size={18} className="absolute inset-0 m-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {isGroupMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : groupMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-base-content/50">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupMessages.map((msg, index) => {
            const isCurrentUser = msg.senderId?._id === authUser._id;
            const previousMessage = index > 0 ? groupMessages[index - 1] : null;

            // Check if this is the same sender as the previous message
            const isSameSender =
              previousMessage &&
              previousMessage.senderId?._id === msg.senderId?._id;

            // Check if messages are close in time (within 5 minutes)
            const isCloseInTime =
              previousMessage &&
              Math.abs(
                new Date(msg.createdAt) - new Date(previousMessage.createdAt)
              ) <
                5 * 60 * 1000;

            // Show sender name if it's a different sender OR if there's a significant time gap
            const shouldShowSenderName = !isSameSender || !isCloseInTime;

            return (
              <div
                key={msg._id}
                className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
              >
                <div className={getBubbleClasses(isCurrentUser)}>
                  {/* Sender name at the top of bubble - only show if different sender */}
                  {shouldShowSenderName && (
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isCurrentUser
                          ? "text-primary-content" // Use primary-content for "You" on primary background
                          : "text-primary" // Use primary color for other users
                      }`}
                    >
                      {isCurrentUser ? "You" : msg.senderId?.fullName}
                    </div>
                  )}

                  {/* Message content */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Attachment"
                      className="w-full max-w-[280px] rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        setSelectedImage({ url: msg.image, name: "Image" })
                      }
                    />
                  )}
                  {msg.document && (
                    <div className="mb-3 p-3 bg-base-200 rounded-lg border border-base-300">
                      <div className="flex items-center gap-3">
                        <FileText className="size-8 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {msg.documentName || "Document"}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {msg.documentName
                              ? msg.documentName
                                  .split(".")
                                  .pop()
                                  .toUpperCase() + " Document"
                              : "Document"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`http://localhost:5000/api/download/${msg.document
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            Download
                          </a>
                          <a
                            href={`http://localhost:5000/api/documents/${msg.document
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.text && (
                    <p className="mb-2 leading-relaxed break-words">
                      {msg.text}
                    </p>
                  )}

                  {/* Timestamp at the bottom of bubble */}
                  <time
                    className={`text-xs opacity-70 font-medium ${
                      isCurrentUser ? "self-end" : "self-start"
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Auto-scroll target */}
        <div ref={scrollRef} />
      </div>

      {/* File Upload Inputs */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        ref={docInputRef}
        onChange={(e) => handleFileChange(e, "document")}
      />

      {/* Message Input */}
      <div className="p-4 w-full">
        {filePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              {filePreview.type === "image" ? (
                <img
                  src={filePreview.url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-base-300"
                />
              ) : (
                <div className="w-20 h-20 bg-base-200 border border-base-300 rounded-lg flex items-center justify-center">
                  <FileText className="size-8 text-base-content/60" />
                </div>
              )}
              <button
                onClick={removeFile}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center hover:bg-base-400 transition-colors"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
            <div className="text-sm text-base-content/70">
              {filePreview.name}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* Text input with mic inside */}
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg pr-12"
              placeholder={
                isSending ? "Sending..." : "Type a message or use mic..."
              }
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                // Send typing indicator
                if (e.target.value.trim() && selectedGroup) {
                  sendTypingIndicator(authUser.fullName);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isSending) {
                  e.preventDefault();
                  sendStopTypingIndicator();
                  handleSendMessage(e);
                }
              }}
              onBlur={() => {
                sendStopTypingIndicator();
              }}
              disabled={isSending}
            />
            {/* Mic Icon Inside Input */}
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop Recording" : "Start Recording"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* File Upload Button with Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="btn btn-circle btn-ghost"
              onClick={() => setShowFileMenu(!showFileMenu)}
              title="Attach file"
              disabled={isSending}
            >
              <Paperclip className="size-5" />
            </button>

            {/* Dropdown Menu */}
            {showFileMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 min-w-[120px] z-10">
                <button
                  onClick={() => handleFileSelect("image")}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-sm"
                >
                  <Image className="size-4" />
                  Picture
                </button>
                <button
                  onClick={() => handleFileSelect("document")}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-sm"
                >
                  <FileText className="size-4" />
                  Document
                </button>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            className="btn btn-circle btn-primary"
            disabled={(!messageText.trim() && !filePreview) || isSending}
          >
            {isSending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Send size={22} />
            )}
          </button>
        </form>
      </div>

      {/* Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50">
          <GroupInfoModal onClose={() => setShowGroupInfo(false)} />
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

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default GroupChatContainer;
