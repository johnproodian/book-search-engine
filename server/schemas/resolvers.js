const { User, Book } = require('../models');

const resolvers = {
    Query: {
        yo: async () => {
            const yo = 'yo';

            return yo;
        } 
    }
};

module.exports = resolvers;