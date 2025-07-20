// routes/group.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  sendGroupMessage,
  getGroupMessages,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroupInfo,
  markGroupMessagesAsRead,
  deleteGroupPhoto,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Create new group
router.post("/create", protectRoute, createGroup);

// Get all groups for a logged-in user
router.get("/my-groups", protectRoute, getUserGroups);

// Send message to a group
router.post("/send/:groupId", protectRoute, sendGroupMessage);

// Get messages from a group
router.get("/messages/:groupId", protectRoute, getGroupMessages);

// Add member to group (admin only)
router.put("/add-member/:groupId", protectRoute, addMemberToGroup);

// Remove member from group (admin only)
router.put("/remove-member/:groupId", protectRoute, removeMemberFromGroup);

// Update group info (admin only)
router.put("/:groupId", protectRoute, updateGroupInfo);

// Delete group photo (admin only)
router.delete("/:groupId/photo", protectRoute, deleteGroupPhoto);

// Delete group (admin only)
router.delete("/:groupId", protectRoute, deleteGroup);

// Mark group messages as read
router.put("/read/:groupId", protectRoute, markGroupMessagesAsRead);

export default router;
