import { registerAs } from '@nestjs/config';

export default registerAs('graphql', () => ({
  playground: process.env.GQL_PLAYGROUND === 'true',
  debug: process.env.GQL_DEBUG === 'true',
  context: ({ req, connection }) =>
    connection ? { req: connection.context } : { req },
  autoSchemaFile: 'src/schema.gql',
  sortSchema: true,
  introspection: true,
}));
