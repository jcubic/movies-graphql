const { gql, ApolloServer } = require('apollo-server');
const util = require('util')
require('dotenv').config();

const tmdb = require('tmdbv3').init(process.env.TMDB_API_KEY);

function get_movies_url(path, query = {}) {
    const params = new URLSearchParams({
        api_key: API_KEY,
        language: 'en-US',
        ...query
    });
    return `${base}${path}?${params}`;
}

const search_movie = util.promisify(tmdb.search.movie);
const get_movie_cast = util.promisify(tmdb.movie.casts);
const get_person_cast = util.promisify(tmdb.person.credits);

search_movie('matrix').then(console.log);

const resolvers = {
    Query: {
        movies: async () => (await search_movie('matrix')).results
    },
    Movie: {
        cast: (parent) => get_movie_cast(parent.id).then(res => res.cast)
    },
    Cast: {
        movies: (parent) => get_person_cast(parent.id).then(res => res.cast)
    }
};

const typeDefs = gql`
    type Query {
       movies: [Movie]!
    }
    type Movie {
      id: Int!
      title: String
      overview: String
      release_date: String
      cast: [Cast]!
    }
    type Cast {
      id: Int
      name: String
      character: String
      movies: [Movie]!
    }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

server.listen({
  port: 3000
}).then(result => {
  console.log(`Listening on ${result.url}`);
});
