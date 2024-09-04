const { verify, sign } = require('jsonwebtoken');

module.exports = {
  // function for our authenticated routes
  authMiddleware: ({ req, res }) => {
    const token = req.cookies.token;
    let user_id = null;

    if (token) {
      try {
        const { user_id: id } = verify(token, process.env.JWT_SECRET);

        user_id = id;
      } catch (error) {
        console.log('token verification error', error);
      }
    }

    return {
      user_id,
      req,
      res
    }
  },
  createToken: function (user_id) {
    const token = sign({ user_id: user_id }, process.env.JWT_SECRET);

    return token;
  },
};
