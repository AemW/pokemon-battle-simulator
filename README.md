# Pokémon battle simulator

A simple server with an API for simulating Pokémon battles. The API contains three endpoints: one to fetch all available Pokémon, one for fetching Pokémon information for a given id, and lastly the battle simulation API.

## Requirements

- Node.js (v22.9.0) runtime installed (including npm)

## Setup

1. From the root directory of the repository, run:

```sh
npm install
```

This will install all required dependencies.

2. Then start the server using:

```sh
npm run start
```

By default, the server will run on `localhost:3000`. You can configure the server using environment variables if needed.

## Using the API

You can call the simulation API by using curl or other tool such as Postman. Swagger can also be used as documented in [Swagger Documentation](#swagger-documentation). The simulation API requires two teams, each with a name and a list of Pokémon ids.

_note_: Following command is taken from swagger, and not tested locally, as I'm stuck on a semi-broken windows machine right now.

```sh
curl -X 'POST' \
  'http://localhost:3000/pokemon/simulate' \
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

The server configuration can be adjusted using the following environment variables:

- `PORT`: The port on which the server will run.
- `HOST`: The host address for the server.

## Swagger Documentation

The API is documented using Swagger. Once the server is running, you can access the documentation at `HOST:PORT/documentation` (default: `localhost:3000/documentation`).

This allows you to test the server’s APIs interactively.

## Limitations, decisions, and further improvements

Due to time and hardware constraints, I was unable to test the Docker setup. The included Dockerfile is untested, and I could not add a Docker Compose file with Redis/MongoDB as a database, which I had planned to include.

I decided to test Hapi for this project, instead of Express, since it comes with quite a few nice-to-haves. Since this was the first time I used it there might be a few framework conventions I've missed.

I would also have liked to make a simple react-based frontend, where a user could select pokémon for both teams using a searchable dropdown. Then the results of the simulation could have been simply displayed in a textarea.

The tests could also be expanded upon, since they are somewhat limited right now.

The battle logic is another area where you could keep on improving endlessly, almost ad absurdum. Especially on a more strategic level, using switches, allowing for stats boosts, and more.
