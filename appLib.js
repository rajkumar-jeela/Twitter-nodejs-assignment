//====================================================================//

const { getConnection, bcrypt, jwt } = require("./server.js");

let requestBody = null;
let queryParameters = null;
let databaseQuery = null;
let databaseResponseBody = null;
let jwtToken = null;
let responseBody = null;
let appLibFunctions = null;

//=========================SERVER FUNCTION============================//

const register = async (request, response, next) => {
  const { username, password, name, gender } = request.body;
  databaseQuery = `SELECT * FROM user WHERE username = '${username}'`;
  databaseResponseBody = await databaseConnection.get(databaseQuery);
  if (password.length < 6) {
    response.status(400);
    response.send("Password is too short");
  } else if (databaseResponseBody !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    let passwordHash = await bcrypt.hash(password, 10);
    databaseQuery = `INSERT INTO user(name, username, password, gender) VALUES('${name}','${username}','${passwordHash}','${gender}')`;
    databaseConnection.run(databaseQuery);
    response.status(200);
    response.send("User created successfully");
  }
};

//=========================SERVER FUNCTION============================//

const login = async (request, response, next) => {
  const { username, password } = request.body;
  databaseQuery = `SELECT * FROM user WHERE username = '${username}'`;
  databaseResponseBody = await databaseConnection.get(databaseQuery);
  if (databaseResponseBody === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    let dbPassword = databaseResponseBody.password;
    let compared = await bcrypt.compare(password, dbPassword);
    if (compared) {
      let payload = { user_id: databaseResponseBody.user_id };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      responseBody = { jwtToken: jwtToken };
      response.send(responseBody);
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
};

//=========================SERVER FUNCTION============================//

const getFollowingUsers = async (request, response, next) => {
  const user_id = request.user_id;
  databaseQuery = `select name from follower join user on following_user_id = user.user_id where follower_user_id = ${user_id}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send(databaseResponseBody.map((a) => name(a)));
};

//=========================SERVER FUNCTION============================//

const getUserFollowers = async (request, response, next) => {
  const user_id = request.user_id;
  databaseQuery = `select name from follower join user on follower_user_id = user.user_id where following_user_id = ${user_id}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send(databaseResponseBody.map((a) => name(a)));
};

//=========================SERVER FUNCTION============================//

const getFollowingTweets = async (request, response, next) => {
  const user_id = request.user_id;
  databaseQuery = `SELECT username,tweet,date_time FROM tweet NATURAL JOIN user WHERE user_id in (select following_user_id  from user JOIN follower ON user_id = follower_user_id  where user_id = ${user_id}) order by date_time DESC LIMIT 4`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send(databaseResponseBody.map((a) => tweet(a)));
};

//=========================SERVER FUNCTION============================//

const getUserTweets = async (request, response, next) => {
  const user_id = request.user_id;
  databaseQuery = `SELECT tweet.tweet, count(distinct reply_id) AS cnt_rep, count(distinct like_id) AS cnt_lke, tweet.date_time FROM tweet JOIN reply JOIN like ON tweet.tweet_id = reply.tweet_id AND tweet.tweet_id = like.tweet_id where tweet.user_id = ${user_id} GROUP BY tweet.tweet_id`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send(databaseResponseBody.map((t) => userTweet(t)));
};

//=========================SERVER FUNCTION============================//

const getUserTweet = async (request, response, next) => {
  const user_id = request.user_id;
  const { tweetId } = request.params;
  databaseQuery = `SELECT tweet.tweet, count(distinct reply_id) AS cnt_rep, count(distinct like_id) AS cnt_lke, tweet.date_time FROM tweet JOIN reply JOIN like ON tweet.tweet_id = reply.tweet_id AND tweet.tweet_id = like.tweet_id where tweet.tweet_id = ${tweetId}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send(userTweet(databaseResponseBody[0]));
};

//=========================SERVER FUNCTION============================//

const getUserLikes = async (request, response, next) => {
  const { tweetId } = request.params;
  databaseQuery = `select username from like JOIN user on like.user_id = user.user_id  where tweet_id = ${tweetId}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  response.send({ likes: databaseResponseBody.map((user) => user.username) });
};

//=========================SERVER FUNCTION============================//

const getUserReplies = async (request, response, next) => {
  const { tweetId } = request.params;
  databaseQuery = `select name, reply from reply JOIN user on reply.user_id = user.user_id where tweet_id = ${tweetId}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  let replies = databaseResponseBody.map((a) => ({
    name: a.name,
    reply: a.reply,
  }));
  response.send({ replies: replies });
};

//=========================SERVER FUNCTION============================//

const sendTweet = async (request, response, next) => {
  const user_id = request.user_id;
  const { tweet } = request.body;
  databaseQuery = `INSERT INTO tweet(tweet, user_id, date_time) VALUES('${tweet}', ${user_id}, DATETIME("now"))`;
  databaseConnection.run(databaseQuery);
  console.log(databaseQuery);
  response.send("Created a Tweet");
};

//=========================SERVER FUNCTION============================//

const deleteTweet = async (request, response, next) => {
  const user_id = request.user_id;
  const { tweetId } = request.params;
  databaseQuery = `SELECT tweet_id FROM tweet WHERE user_id = ${user_id} AND tweet_id = ${tweetId}`;
  databaseResponseBody = await databaseConnection.get(databaseQuery);
  if (databaseResponseBody !== undefined) {
    databaseQuery = `DELETE FROM tweet WHERE tweet_id = ${tweetId}`;
    await databaseConnection.run(databaseQuery);
    response.send("Tweet Removed");
  } else {
    response.status(401);
    response.send("Invalid Request");
  }
};

//=========================SERVER FUNCTION============================//

const isFollowing = async (request, response, next) => {
  const user_id = request.user_id;
  const { tweetId } = request.params;
  databaseQuery = `SELECT tweet.tweet_id FROM tweet NATURAL JOIN user WHERE user_id in (select following_user_id  from user JOIN follower ON user_id = follower_user_id  where user_id = ${user_id}) AND tweet.tweet_id = ${tweetId}`;
  databaseResponseBody = await databaseConnection.all(databaseQuery);
  if (databaseResponseBody.length !== 1) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    next();
  }
};

//=========================SERVER FUNCTION============================//

const verifyToken = (request, response, next) => {
  const header = request.headers["authorization"];
  if (header !== undefined) {
    jwtToken = header.split(" ")[1];
    if (jwtToken !== undefined) {
      jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          request.user_id = payload.user_id;
          next();
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
};

//=========================SERVER FUNCTION============================//

const tweet = (respBody) => {
  return {
    username: respBody.username,
    tweet: respBody.tweet,
    dateTime: respBody.date_time,
  };
};

//=========================SERVER FUNCTION============================//

const userTweet = (respBody) => {
  return {
    tweet: respBody.tweet,
    likes: respBody.cnt_lke,
    replies: respBody.cnt_rep,
    dateTime: respBody.date_time,
  };
};

//=========================SERVER FUNCTION============================//
const name = (a) => {
  return { name: a.name };
};
//=========================SERVER FUNCTION============================//

getConnection("twitterClone.db").then((connection) => {
  databaseConnection = connection;
});

//====================================================================//

appLibFunctions = {
  register: register,
  login: login,
  verifyToken: verifyToken,
  getFollowingUsers: getFollowingUsers,
  getFollowingTweets: getFollowingTweets,
  getUserFollowers: getUserFollowers,
  getUserTweets: getUserTweets,
  getUserTweet: getUserTweet,
  isFollowing: isFollowing,
  getUserLikes: getUserLikes,
  getUserReplies: getUserReplies,
  sendTweet: sendTweet,
  deleteTweet: deleteTweet,
};

//====================================================================//

exports.appLibFunctions = appLibFunctions;

//====================================================================//
