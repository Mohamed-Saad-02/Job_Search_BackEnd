import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import {
  BanOrUnbannedResolver,
  ListAllUsersResolver,
} from "../resolver/users.resolver.js";
import { UserBannedData, UsersData } from "../types/user.type.js";

export const UsersFields = {
  Query: {
    listUsers: {
      type: UsersData,
      args: {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        access_token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => ListAllUsersResolver(_, args),
    },
  },
  Mutation: {
    banOrUnbannedUser: {
      type: UserBannedData,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        access_token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => BanOrUnbannedResolver(_, args),
    },
  },
};
