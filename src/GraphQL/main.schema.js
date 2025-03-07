import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { UsersFields } from "./fields/users.fields.js";
import { CompaniesFields } from "./fields/company.fields.js";

export const GraphSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuerySchema",
    description: "Main Query Schema",
    fields: {
      ...UsersFields.Query,
      ...CompaniesFields.Query,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainMutationSchema",
    fields: {
      ...CompaniesFields.Mutation,
      ...UsersFields.Mutation,
    },
  }),
});
