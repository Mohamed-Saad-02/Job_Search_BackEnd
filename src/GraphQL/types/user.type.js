import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { MetadataType } from "./common.type.js";
import { HelperQueryResolver } from "../resolver/common.resolver.js";

const userFields = {
  _id: { type: GraphQLID },
  username: { type: GraphQLString },
  email: { type: GraphQLString },
  gender: { type: GraphQLString },
  DOB: {
    type: GraphQLString,
    resolve: (parent) => HelperQueryResolver.formatDate(parent.DOB),
  },
  mobileNumber: { type: GraphQLString },
  role: { type: GraphQLString },
  isConfirmed: { type: GraphQLBoolean },
  createdAt: {
    type: GraphQLString,
    resolve: (parent) => HelperQueryResolver.formatDate(parent.createdAt),
  },
  updatedAt: {
    type: GraphQLString,
    resolve: (parent) => HelperQueryResolver.formatDate(parent.updatedAt),
  },
  deletedAt: {
    type: GraphQLString,
    resolve: (parent) => HelperQueryResolver.formatDate(parent.deletedAt),
  },
  bannedAt: {
    type: GraphQLString,
    resolve: (parent) => HelperQueryResolver.formatDate(parent.bannedAt),
  },
  updatedBy: {
    type: GraphQLString,
    resolve: (parent) => parent.updatedBy || "",
  },
};

// Query
export const UserType = new GraphQLObjectType({
  name: "UserType",
  description: "Type Of User",
  fields: userFields,
});

export const UsersData = new GraphQLObjectType({
  name: "UsersData",
  fields: {
    metadata: {
      type: MetadataType,
    },
    users: {
      type: new GraphQLList(UserType),
    },
  },
});

// Mutation

export const UserBannedData = new GraphQLObjectType({
  name: "UserBannedData",
  fields: userFields,
});
