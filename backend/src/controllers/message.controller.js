import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { uploadDocument } from "../lib/documentUpload.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except the logged-in user
    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // Get the latest message timestamp and unread count for each user
    const usersWithLatestMessage = await Promise.all(
      users.map(async (user) => {
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        // Get unread message count
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: false,
        });

        return {
          ...user.toObject(),
          latestMessageTime: latestMessage ? latestMessage.createdAt : null,
          unreadCount,
        };
      })
    );

    // Sort users by latest message time (most recent first)
    const sortedUsers = usersWithLatestMessage.sort((a, b) => {
      if (!a.latestMessageTime && !b.latestMessageTime) return 0;
      if (!a.latestMessageTime) return 1;
      if (!b.latestMessageTime) return -1;
      return new Date(b.latestMessageTime) - new Date(a.latestMessageTime);
    });

    // Remove the temporary latestMessageTime field but keep unreadCount
    const finalUsers = sortedUsers.map(
      ({ latestMessageTime, ...user }) => user
    );

    res.status(200).json(finalUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    console.log("sendMessages called with body:", {
      hasText: !!req.body.text,
      hasImage: !!req.body.image,
      hasDocument: !!req.body.document,
      documentName: req.body.documentName,
    });

    const { text, image, document, documentName } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let documentUrl;

    if (image) {
      try {
        console.log("Attempting to upload image...");
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res
          .status(400)
          .json({ error: "Failed to upload image: " + uploadError.message });
      }
    }

    if (document) {
      try {
        console.log("Attempting to upload document:", documentName);

        // Upload document to local storage
        documentUrl = await uploadDocument(document, documentName);
        console.log("Document uploaded successfully:", documentUrl);
      } catch (uploadError) {
        console.error("Document upload error:", uploadError);
        return res
          .status(400)
          .json({ error: "Failed to upload document: " + uploadError.message });
      }
    }

    console.log("Creating new message with:", {
      senderId,
      receiverId,
      hasText: !!text,
      hasImage: !!imageUrl,
      hasDocument: !!documentUrl,
    });

    // Validate that at least one content type is present
    if (!text && !imageUrl && !documentUrl) {
      return res
        .status(400)
        .json({ error: "Message must contain text, image, or document" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || "",
      document: documentUrl || "",
      documentName: documentName || "",
    });

    await newMessage.save();
    console.log("Message saved successfully:", newMessage._id);

    // Emit to receiver for real-time chat updates
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Emit to sender for immediate UI update
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessages controller:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Mark all messages from this user as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: myId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    // Emit real-time update to mark unread count as 0
    const mySocketId = getReceiverSocketId(myId);
    if (mySocketId) {
      io.to(mySocketId).emit("messagesMarkedAsRead", { userId });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markMessagesAsRead controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
