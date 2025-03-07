import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const MiniUserType = (name) =>
  new GraphQLObjectType({
    name,
    fields: {
      _id: { type: GraphQLID },
      username: { type: GraphQLString },
    },
  });

export const JobType = new GraphQLObjectType({
  name: "JobType",
  fields: {
    jobTitle: { type: GraphQLString },
    jobLocation: { type: GraphQLString },
    workingTime: { type: GraphQLString },
    seniorityLevel: { type: GraphQLString },
    jobDescription: { type: GraphQLString },
    technicalSkills: { type: new GraphQLList(GraphQLString) },
    softSkills: { type: new GraphQLList(GraphQLString) },
    addedBy: { type: MiniUserType("OwnerType") },
    updatedBy: { type: MiniUserType("UpdatedBy") },
    closed: { type: GraphQLBoolean },
    companyId: { type: GraphQLID },
  },
});
