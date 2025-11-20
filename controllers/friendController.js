import Friend from "../models/friendModels.js";
import User from "../models/userModels.js";

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body; //requesterId can be taken from body because there is no auth middleware
    const requesterId = req.user.id; // Assuming auth middleware sets req.user

    // Check if already requested or friends
    const existing = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    const friendRequest = new Friend({
      requester: requesterId,
      recipient: recipientId,
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent!", friendRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest)
      return res.status(404).json({ message: "Request not found" });

    friendRequest.status = "accepted";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject Friend Request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest)
      return res.status(404).json({ message: "Request not found" });

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request rejected!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Pending Requests for Current User
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const pending = await Friend.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "name email profileImage bio");
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Get all pending user from both sides
export const getAllPendingRequests = async (req, res) => {
  try {
  const userId = req.user.id;
    const pending = await Friend.find({
      $or: [
        { recipient: userId }, // requests sent TO you
        { requester: userId }, // requests sent BY you
      ],
      status: "pending",
    })
      .populate("requester", "name email profileImage bio")
      .populate("recipient", "name email profileImage bio");
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Friends List
export const getFriends = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.params;
    const friends = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    })
      .populate("requester", "name email profileImage bio")
      .populate("recipient", "name email profileImage bio");

    // 👇 Clean up the response to always return "the other user"
    const formatted = friends.map((f) =>
      f.requester._id.toString() === userId ? f.recipient : f.requester
    );

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unfriend a user

export const unfriendUser = async (req, res) => {
  try {
    const userId = req.user.id;       // logged-in user
    const friendId = req.params.id;   // the user to unfriend

    // Find existing accepted friendship in either direction
    const friendship = await Friend.findOneAndDelete({
      status: "accepted",
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    return res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.error("Unfriend error:", error);
    res.status(500).json({ message: "Server error while unfriending" });
  }
};

