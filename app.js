//====================================================================//

const { server } = require("./server.js");

const { appLibFunctions } = require("./appLib.js");

const {
  register,
  login,
  verifyToken,
  getFollowingUsers,
  getFollowingTweets,
  getUserFollowers,
  getUserTweets,
  getUserTweet,
  isFollowing,
  getUserLikes,
  getUserReplies,
  sendTweet,
  deleteTweet,
} = appLibFunctions;

//==========================SERVER CODE===============================//

server.post("/register/", register, async (req, res) => {});
server.post("/login/", login, async (req, res) => {});
server.get(
  "/user/tweets/feed/",
  verifyToken,
  getFollowingTweets,
  async (req, res) => {}
);
server.get(
  "/user/following/",
  verifyToken,
  getFollowingUsers,
  async (req, res) => {}
);
server.get(
  "/user/followers/",
  verifyToken,
  getUserFollowers,
  async (req, res) => {}
);
server.get("/user/tweets/", verifyToken, getUserTweets, async (req, res) => {});
server.get(
  "/tweets/:tweetId/",
  verifyToken,
  isFollowing,
  getUserTweet,
  async (req, res) => {}
);
server.get(
  "/tweets/:tweetId/likes/",
  verifyToken,
  isFollowing,
  getUserLikes,
  async (req, res) => {}
);

server.get(
  "/tweets/:tweetId/replies/",
  verifyToken,
  isFollowing,
  getUserReplies,
  async (req, res) => {}
);
server.post("/user/tweets/", verifyToken, sendTweet, async (req, res) => {});
server.delete(
  "/tweets/:tweetId/",
  verifyToken,
  deleteTweet,
  async (req, res) => {}
);

//==========================SERVER CODE===============================//

module.exports = server;

//====================================================================//
