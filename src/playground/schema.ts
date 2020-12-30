import { Context, ServerError } from '@via-profit-services/core';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLBoolean } from 'graphql';

type SendArgs = {
  phones: string[];
  message: string;
};

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType<unknown, Context>({
    name: 'Query',
    fields: () => ({
      test: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'Test',
      },
    }),
  }),
  mutation: new GraphQLObjectType<unknown, Context>({
    name: 'Mutation',
    fields: () => ({
      send: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          phones: {
            type: new GraphQLNonNull(GraphQLList(GraphQLString)),
            description: 'List of phones',
          },
          message: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Message text',
          },
        },
        resolve: async (_parent, args: SendArgs, context) => {
          const { services } = context;
          const { phones, message } = args;
          try {
            services.sms.send({ phones, message });
          } catch (err) {
            throw new ServerError('Failed to send SMS');
          }

          return true;
        },
      },
    }),
  }),
});

export default Schema;
