# Pokémon battle simulator

An application for simulating Pokémon battles. The app consists of a backend server with the simulation API and a AI generated react frontend.

## Requirements

- Node.js (>= v20) runtime installed (including npm). Node.js can be installed from the [Node.js website](https://nodejs.org/en).

## Setup

1. From the root directory of the repository, run:

```sh
npm install
```

This will install all required dependencies.

2. Then start the application using:

```sh
npm run start
```

By default, the app will run on `localhost:3000`. You can configure the server using environment variables if needed.

## Pokémon team builder

This is the react frontend application, reachable on `localhost:3000`. It consists of two searchable dropdowns where you can select pokémon for each team. Each pokémon chosen will appear under the dropdown, as an image. After the teams are chosen, press the battle button to start the simulation. The result will appear in the textarea.

## Using the API

The API contains three endpoints: one to fetch all available Pokémon, one for fetching Pokémon information for a given id, and lastly the battle simulation API. You can call the simulation API directly by using curl or other tool such as Postman. Swagger can also be used as documented in [Swagger Documentation](#swagger-documentation). The simulation API requires two teams, each with a name and a list of Pokémon ids.

_note_: Following command is taken from swagger, and not tested locally, as I'm stuck on a semi-broken windows machine right now.

```sh
curl -X 'POST' \
  'http://localhost:4000/pokemon/simulate' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "team1": {
    "name": "trainer 1",
    "pokemon": [
      33, 51
    ]
  },
  "team2": {
    "name": "trainer 2",
    "pokemon": [
      11, 67
    ]
  }
}'
```

## Environment Variables

Changing these are **not recommended** when using the frontend application since it will not work without the default configuration.

The server configuration can be adjusted using the following environment variables:

- `PORT`: The port on which the server will run.
- `HOST`: The host address for the server.

## Swagger Documentation

The API is documented using Swagger. Once the server is running, you can access the documentation at `HOST:PORT/documentation` (default: `localhost:4000/documentation`).

This allows you to test the server’s APIs interactively.

## Repo structure

The top level contains mostly config, and dependencies for eslint. The reason I've installed the linter here is that I want it to be aligned for any number of sub-projects (backend, frontend, and more).
The backend folder contains the actual server, with the APIs. I tried a modular structure using Hapi plugins, bundling logic, routes, types, etc., for the feature in a single location. Only the test file
has been placed in a separate folder, in `backend/tests`.

The entrypoint for the server is the file `backend/src/index.ts`, which registers all plugins and starts the server. The pokémon plugin is imported from `backend/src/plugins/pokemon`. The `index.ts` file
contains the plugin, route definitions, route handlers, and validation schemas. `simulateBattle.ts` and `typeEffectivness.ts` holds the main logic for the plugin, and all types are located in `types.ts`.

The frontend application is located in the `pokemon-team-builder` folder. It's created using `create-react-app` and AI. The AI generated code is mostly located in `PokemonTeamBuilder.tsx`.

## Limitations, decisions, and further improvements

Due to time and hardware constraints, I was unable to test a Docker setup. The included Dockerfile is untested, and I could not add a Docker Compose file with Redis/MongoDB as a database, which I had planned to include.

I decided to test Hapi for this project, instead of Express, since it comes with quite a few nice-to-haves. Since this was the first time I used it there might be a few framework conventions I've missed.

~~I would also have liked to make a simple react-based frontend, where a user could select pokémon for both teams using a searchable dropdown. Then the results of the simulation could have been simply displayed in a textarea.~~

The application comes with a AI generated react application. Minimal work done to make it work.

The tests could be expanded upon, since they are somewhat limited right now.

The battle logic is another area where you could keep on improving endlessly, almost ad absurdum. Especially on a more strategic level, using switches, allowing for stats boosts, and more. A better solution for
the battle event handling might be to use an EventEmitter. This would most likely require less passing around of data.

Another idea I had was to create a github actions workflow for running the tests and linter, and gate PRs if the workflow failed.
