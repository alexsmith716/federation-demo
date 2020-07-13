const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { RESTDataSource } = require('apollo-datasource-rest');

class GoogleBooksAPI extends RESTDataSource {
	constructor() {
		super();
		this.baseURL = 'https://www.googleapis.com/books/v1/volumes';
	}

	//	{
	//	  googleBook(id: "5cXYPgAACAAJ") {
	//	    etag
	//	    selfLink
	//	  }
	//	}
	async getAGoogleBook(id) {
		const response = await this.get(`/${id}`);
		return response;
	}
}

const resolvers = {
	Query: {
		googleBook: async (_source, { id }, { dataSources }) => {
			const book = await dataSources.GoogleBooksAPI.getAGoogleBook(id);
		  return book;
		}
	}
}

const typeDefs = gql`
	extend type Query {
		googleBook(id: ID!): GoogleBook
	}
	type GoogleBook {
		id: ID!
		kind: String
		etag: String
		selfLink: String
	}
`;

const server = new ApolloServer({
	schema: buildFederatedSchema([
		{
			typeDefs,
			resolvers,
		},
	]),
	dataSources: () => ({
		GoogleBooksAPI: new GoogleBooksAPI()
	}),
});

server.listen({ port: 4005 }).then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});
