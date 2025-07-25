import cloudinary from "../lib/cloudinary.js";
import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";
import { uploadDocument } from "../lib/documentUpload.js";

// Create Group
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupPic } = req.body;
    const admin = req.user._id;

    // console.log("Creating group:", {
    //   name,
    //   members,
    //   admin,
    //   hasGroupPic: !!groupPic,
    // });

    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    const groupData = {
      name,
      admin,
      members: [...members, admin], // Include creator too
    };

    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupData.groupPic = uploadResponse.secure_url;
    }

    const group = await Group.create(groupData);
    await group.populate("members", "-password");

    // console.log("Group created successfully:", group._id);

    // Add all members to the group socket room
    const { getReceiverSocketId } = await import("../lib/socket.js");
    group.members.forEach((member) => {
      const userSocketId = getReceiverSocketId(member._id);
      if (userSocketId) {
        io.to(userSocketId).socketsJoin(group._id.toString());
        // console.log(`Added member ${member._id} to group room ${group._id}`);
      }
    });

    // Emit real-time group creation to all added members
    group.members.forEach((member) => {
      const userSocketId = getReceiverSocketId(member._id);
      if (userSocketId) {
        // console.log(
        //   `Emitting groupCreated to user ${member._id} (socket: ${userSocketId})`
        // );
        const eventData = {
          group: {
            _id: group._id,
            name: group.name,
            admin: group.admin,
            members: group.members,
            groupPic: group.groupPic,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            unreadCount: 0, // New groups start with 0 unread messages
          },
          addedBy: admin,
        };
        // console.log("Event data being sent:", eventData);
        io.to(userSocketId).emit("groupCreated", eventData);
      } else {
        console.log(
          `User ${member._id} not connected, skipping groupCreated emission`
        );
      }
    });

    // console.log("Group creation completed, sending response");
    res.status(201).json(group);
  } catch (error) {
    // console.error("Error in createGroup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Groups of Logged-In User
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all groups the user is a member of
    const groups = await Group.find({ members: userId }).populate(
      "members",
      "-password"
    );

    // Get the latest message timestamp and unread count for each group
    const groupsWithLatestMessage = await Promise.all(
      groups.map(async (group) => {
        const latestMessage = await GroupMessage.findOne({
          groupId: group._id,
        }).sort({ createdAt: -1 });

        // Get unread message count for this user in this group
        // Exclude messages sent by the user themselves
        const unreadCount = await GroupMessage.countDocuments({
          groupId: group._id,
          senderId: { $ne: userId }, // Exclude messages sent by this user
          "readBy.userId": { $ne: userId },
        });

        return {
          ...group.toObject(),
          latestMessageTime: latestMessage ? latestMessage.createdAt : null,
          unreadCount,
        };
      })
    );

    // Sort groups by latest message time (most recent first)
    // But prioritize newly created groups (no messages) at the top
    const sortedGroups = groupsWithLatestMessage.sort((a, b) => {
      // If both groups have no messages, sort by creation date (newest first)
      if (!a.latestMessageTime && !b.latestMessageTime) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // If only one has no messages, put it at the top
      if (!a.latestMessageTime) return -1;
      if (!b.latestMessageTime) return 1;
      // If both have messages, sort by latest message time
      return new Date(b.latestMessageTime) - new Date(a.latestMessageTime);
    });

    // Remove the temporary latestMessageTime field but keep unreadCount
    const finalGroups = sortedGroups.map(
      ({ latestMessageTime, ...group }) => group
    );

    res.status(200).json(finalGroups);
  } catch (error) {
    console.error("Error in getUserGroups:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Send Group Message
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, document, documentName } = req.body;
    const senderId = req.user._id;

    let imageUrl;
    let documentUrl;

    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ error: "Failed to upload image" });
      }
    }

    if (document) {
      try {
        // Upload document to local storage
        documentUrl = await uploadDocument(document, documentName);
      } catch (uploadError) {
        console.error("Document upload error:", uploadError);
        return res.status(400).json({ error: "Failed to upload document" });
      }
    }

    // Validate that at least one content type is present
    if (!text && !imageUrl && !documentUrl) {
      return res
        .status(400)
        .json({ error: "Message must contain text, image, or document" });
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text: text || "",
      image: imageUrl || "",
      document: documentUrl || "",
      documentName: documentName || "",
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate(
      "senderId",
      "fullName profilePic"
    );

    // Emit to all group members using room = groupId
    io.to(groupId).emit("newGroupMessage", populatedMessage);

    res.status(200).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Messages of a Group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await GroupMessage.find({ groupId }).populate(
      "senderId",
      "fullName profilePic"
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add Member to Group
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group.admin.equals(req.user._id)) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userId);
    await group.save();
    await group.populate("members", "-password");

    // Add user to group socket room
    const { getReceiverSocketId } = await import("../lib/socket.js");
    const userSocketId = getReceiverSocketId(userId);
    if (userSocketId) {
      const { io } = await import("../lib/socket.js");
      io.to(userSocketId).socketsJoin(groupId);
    }

    // Emit real-time member update to all group members
    io.to(groupId).emit("groupMemberAdded", {
      groupId,
      group,
      addedUserId: userId,
    });

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in addMemberToGroup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove Member from Group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group.admin.equals(req.user._id)) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();
    await group.populate("members", "-password");

    // Remove user from group socket room
    const { getReceiverSocketId } = await import("../lib/socket.js");
    const userSocketId = getReceiverSocketId(userId);
    if (userSocketId) {
      const { io } = await import("../lib/socket.js");
      io.to(userSocketId).socketsLeave(groupId);
    }

    // Emit real-time member update to all group members
    io.to(groupId).emit("groupMemberRemoved", {
      groupId,
      group,
      removedUserId: userId,
    });

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in removeMemberFromGroup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Group Info (name, picture)
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.admin.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update group info" });
    }

    if (name) group.name = name;
    if (groupPic) {
      // console.log("Received groupPic (length):", groupPic.length);
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      group.groupPic = uploadResponse.secure_url;
      // console.log("New groupPic URL:", group.groupPic);
    }
    await group.save();
    await group.populate("members", "-password");

    // Emit real-time group info update to all group members
    io.to(groupId).emit("groupInfoUpdated", {
      groupId,
      group,
    });

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroupInfo:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Group Photo
export const deleteGroupPhoto = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.admin.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can delete group photo" });
    }

    if (!group.groupPic) {
      return res.status(400).json({ message: "Group has no photo to delete" });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (group.groupPic.includes("cloudinary.com")) {
      try {
        const publicId = group.groupPic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove group photo from database
    group.groupPic = null;
    await group.save();
    await group.populate("members", "-password");

    // Emit real-time group info update to all group members
    io.to(groupId).emit("groupInfoUpdated", {
      groupId,
      group,
    });

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in deleteGroupPhoto:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark Group Messages as Read
export const markGroupMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Mark all unread messages in this group as read for this user
    await GroupMessage.updateMany(
      {
        groupId,
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      }
    );

    // Emit real-time update to mark unread count as 0
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const userSocketId = getReceiverSocketId(userId);
    if (userSocketId) {
      io.to(userSocketId).emit("groupMessagesMarkedAsRead", { groupId });
    }

    res.status(200).json({ message: "Group messages marked as read" });
  } catch (error) {
    console.error("Error in markGroupMessagesAsRead:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Group (admin only)
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user._id;

    // console.log("Deleting group:", { groupId, adminId });

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is the admin of the group
    if (!group.admin.equals(adminId)) {
      return res
        .status(403)
        .json({ message: "Only admin can delete the group" });
    }

    // Get all members before deleting for socket notifications
    const members = [...group.members];

    // Delete all messages in the group
    await GroupMessage.deleteMany({ groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    // console.log("Group deleted successfully:", groupId);

    // Emit real-time group deletion to all members
    const { getReceiverSocketId } = await import("../lib/socket.js");
    members.forEach((memberId) => {
      const userSocketId = getReceiverSocketId(memberId);
      if (userSocketId) {
        // console.log(
        //   `Emitting groupDeleted to user ${memberId} (socket: ${userSocketId})`
        // );
        io.to(userSocketId).emit("groupDeleted", {
          groupId,
          groupName: group.name,
          deletedBy: adminId,
        });
      } else {
        console.log(
          `User ${memberId} not connected, skipping groupDeleted emission`
        );
      }
    });

    // console.log("Group deletion completed, sending response");
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
