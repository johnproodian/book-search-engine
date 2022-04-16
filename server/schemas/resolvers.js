const { AuthenticationError } = require('apollo-server-errors');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        // works
        me: async (parent, args, context) => {
            console.log(context.user);
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        } 

        // getSingleUser --> or is that me??

    },

    Mutation: {
        // works
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { user, token };
        },
        // works
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };

        },
        // saveBook
        saveBook: async (parents, args, context) => {
            console.log(context.user.username);
            if (context.user) {
                const book = await Book.create({...args, username: context.user.username})
                
                await console.log(book);

                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true }
                );
                console.log(updatedUser)

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

        // deleteBook
        deleteBook: async(parents, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId }} },
                    { new: true }
                );
                return updatedUser;
            }

            

        }

    }
};

module.exports = resolvers;