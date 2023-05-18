require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesServices');
const NotesValidator = require('./validator/notes');
const users = require('./api/users');
const UsersValidator = require('./validator/users');
const UsersServices = require('./services/postgres/UsersServices');
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsServices');
const TokenManager = require('./tokenize/tokenManager');
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsServies');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const usersService = new UsersServices();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
