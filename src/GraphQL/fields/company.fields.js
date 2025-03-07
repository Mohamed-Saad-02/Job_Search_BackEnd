import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import {
  ApproveCompanyResolver,
  BanOrUnbannedResolver,
  ListAllCompaniesResolver,
} from "../resolver/companies.resolver.js";
import {
  CompaniesData,
  CompanyApprovedData,
  CompanyBannedData,
} from "../types/company.type.js";

export const CompaniesFields = {
  Query: {
    listCompanies: {
      type: CompaniesData,
      args: {
        access_token: { type: new GraphQLNonNull(GraphQLString) },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: (_, args) => ListAllCompaniesResolver(_, args),
    },
  },
  Mutation: {
    approveCompany: {
      type: CompanyApprovedData,
      args: {
        companyId: { type: new GraphQLNonNull(GraphQLID) },
        access_token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => ApproveCompanyResolver(_, args),
    },
    banOrUnbannedCompany: {
      type: CompanyBannedData,
      args: {
        companyId: { type: new GraphQLNonNull(GraphQLID) },
        access_token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => BanOrUnbannedResolver(_, args),
    },
  },
};
