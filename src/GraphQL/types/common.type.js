import { GraphQLInt, GraphQLObjectType } from "graphql";

export const MetadataType = new GraphQLObjectType({
  name: "Metadata",
  fields: {
    page: { type: GraphQLInt },
    totalPages: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    total: { type: GraphQLInt },
    results: { type: GraphQLInt },
  },
});
