import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { MetadataType } from "./common.type.js";
import { HelperQueryResolver } from "../resolver/common.resolver.js";
import { JobType } from "./job.type.js";

// Query

const CompanyUserType = (name) =>
  new GraphQLObjectType({
    name,
    fields: {
      _id: { type: GraphQLID },
      username: { type: GraphQLString },
    },
  });

const CompanyType = new GraphQLObjectType({
  name: "CompanyType",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    createdBy: { type: CompanyUserType("CreatedByType") },
    HRs: {
      type: new GraphQLList(CompanyUserType("UserHRType")),
    },
    approvedByAdmin: { type: GraphQLBoolean },
    createdAt: {
      type: GraphQLString,
      resolve: (parent) => HelperQueryResolver.formatDate(parent.createdAt),
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (parent) => HelperQueryResolver.formatDate(parent.updatedAt),
    },

    jobs: {
      type: new GraphQLList(JobType),
    },
    bannedAt: {
      type: GraphQLString,
      resolve: (parent) => HelperQueryResolver.formatDate(parent.bannedAt),
    },
    deletedAt: {
      type: GraphQLString,
      resolve: (parent) => HelperQueryResolver.formatDate(parent.deletedAt),
    },

    // Logo: {},
    // coverPic: {},
    // legalAttachment: {},
  },
});

export const CompaniesData = new GraphQLObjectType({
  name: "CompaniesData",
  fields: {
    metadata: {
      type: MetadataType,
    },
    companies: {
      type: new GraphQLList(CompanyType),
    },
  },
});

// Mutation
export const CompanyApprovedData = new GraphQLObjectType({
  name: "CompanyApproved",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    createdBy: { type: CompanyUserType("CreatedByMutationType") },
    HRs: {
      type: new GraphQLList(CompanyUserType("UsersHRMutationType")),
    },
    approvedByAdmin: { type: GraphQLBoolean },
  },
});

export const CompanyBannedData = new GraphQLObjectType({
  name: "CompanyAfterBanned",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    createdBy: { type: CompanyUserType("CreatedByMutationTypeBanned") },
    HRs: {
      type: new GraphQLList(CompanyUserType("UsersHRMutationTypeBanned")),
    },
    approvedByAdmin: { type: GraphQLBoolean },
    bannedAt: {
      type: GraphQLString,
      resolve: (parent) => HelperQueryResolver.formatDate(parent.bannedAt),
    },
  },
});
