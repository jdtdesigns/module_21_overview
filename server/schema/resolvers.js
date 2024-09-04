const { User } = require('../models');
const { GraphQLError } = require('graphql');

const { createToken } = require('../utils/auth');

const resolvers = {
  Query: {
    async getUser(_, args, context) {
      if (!context.user_id) {
        return {
          user: null
        }
      }

      const user = await User.findById(context.user_id);

      if (!user) {
        return {
          user: null
        }
      }

      return {
        user
      };
    },
  },

  Mutation: {
    async registerUser(_, args, context) {
      try {
        const user = await User.create(args);

        // Create a cookie and attach a JWT token
        const token = createToken(user._id);

        context.res.cookie('token', token, {
          httpOnly: true
        });

        return {
          message: 'User registered successfully!',
          user
        }
      } catch (error) {
        console.log('register error', error);

        if (error.code === 11000) {
          throw new GraphQLError('A user with that email address or username already exists')
        }

        throw new GraphQLError(error.message.split(':')[2].trim());
      }
    },

    async loginUser(_, args, context) {
      const user = await User.findOne({
        email: args.email
      });

      if (!user) {
        throw new GraphQLError('No user found by that email address.');
      }

      const valid_pass = await user.validatePassword(args.password);

      if (!valid_pass) {
        throw new GraphQLError('Password incorrect.');
      }

      const token = createToken(user._id); // Create a JWT

      context.res.cookie('token', token, {
        httpOnly: true
      }); // Send a cookie with the JWT attached

      return {
        message: 'Logged in successfully!',
        user
      }
    },

    logoutUser(_, args, context) {
      context.res.clearCookie('token');

      return {
        message: 'Logged out successfully'
      }
    },

    async saveBook(_, args, { user_id }) {
      if (!user_id) {
        throw new GraphQLError('You are not authorized');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user_id },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );

        return {
          user: updatedUser
        };
      } catch (err) {
        console.log(err);
        return {
          message: 'Save book error'
        }
      }

    }

  }
};

module.exports = resolvers;