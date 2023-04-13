require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesServices');
const NotesValidator = require('./validator/notes');
const users = require('./api/users');
const UsersValidator = require('./validator/users');
const UsersServices = require('./services/postgres/UsersServices');

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersServices();

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
