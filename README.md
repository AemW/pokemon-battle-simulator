# Pokemon battle simulator

A very simple server with an API for "simulating" pokemon battles.

## Quickstart

**_Requires_** that the nodejs runtime is installed (including npm)

From the root of the repo run `npm install`. This will install all required dependencies .
Then start the server using `npm run start`. By default the server will run on `0.0.0.0:3000`.

The simulation API can then be called as follows:

```sh
curl -X 'POST' \
  'http://localhost:3000/pkm/simulate' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "team1": {
    "name": "trainer 1",
    "pkms": [
      33, 51
    ]
  },
  "team2": {
    "name": "trainer 2",
    "pkms": [
      11, 67
    ]
  }
}'
```

## Env variables

Server configuration by env variables:

- PORT: The hostname the server will run on
- HOST: The port the server will use

## Swagger

The API comes configured with simple documentation using swagger. The Swagger can be accessed by starting the server and then navigating to HOST:PORT/documentation. This allows for testing the server's APIs.

## Restraints

Due to unfortunate timing I was unable to design the server on a computer capable of running docker. As such, the included Dockerfile is untested. This also meant that I couldn't add a compose file with redis as database.
