import { badImplementation, badRequest, notFound } from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import data from './pkmData.json'
import { generateBattleLogs, simulateBattle } from './simulateBattle'
import { PkmInfo, typings } from './types'

const pkmPlugin: Hapi.Plugin<undefined> = {
  name: 'pkmPlugin',
  register: async (server: Hapi.Server) => {
    server.route([
      {
        method: 'GET',
        path: '/pkm/list',
        // Return all available pkm
        handler: (request: Hapi.Request): PkmInfo[] => {
          try {
            return data.pokemon
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Failed to get pokemon')
          }
        },
        options: {
          description: 'GET /pkm',
          notes: 'Get all pokemon',
          response: { schema: Joi.array().items(pokemonSchema) },
          tags: ['api'],
        },
      },
      {
        method: 'GET',
        path: '/pkm/{id}',
        // Return a specific pkm, by id
        handler: (request: Hapi.Request): PkmInfo => {
          try {
            const pokemon = data.pokemon.find((pkm) => pkm.id === request.params.id)
            if (!pokemon) {
              throw notFound('Could not find requested pokemon')
            }
            return pokemon
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Failed to get pokemon')
          }
        },
        options: {
          description: 'GET /pkm/{id}',
          notes: 'Get a single pokemon by its id',
          tags: ['api'],
          response: {
            schema: pokemonSchema,
          },
          validate: {
            params: Joi.object({
              id: idSchema,
            }),
            failAction: (_request, _h, err) => {
              throw badRequest(err?.message ?? 'Validation failure')
            },
          },
        },
      },
    ])

    // Separate route due to issues with request typing
    server.route([
      {
        method: 'POST',
        path: '/pkm/simulate',
        handler: (
          request: Hapi.Request<{
            Payload: { team1: { name: string; pkms: number[] }; team2: { name: string; pkms: number[] } }
          }>,
        ): string[] => {
          try {
            const {
              payload: { team1, team2 },
            } = request

            // Fill pkm data from id lists
            const t1 = { name: team1.name, pkms: team1.pkms.map((id) => ({ ...data.pokemon[id - 1], hp: 100 })) }
            const t2 = { name: team2.name, pkms: team2.pkms.map((id) => ({ ...data.pokemon[id - 1], hp: 100 })) }

            return generateBattleLogs(simulateBattle(t1, t2))
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Simulation failure')
          }
        },
        options: {
          description: 'POST /pkm/simulate',
          notes: 'Simulate a battle between two teams, returning the logs of the battle',
          tags: ['api'],
          response: { schema: Joi.array().items(Joi.string()) },
          validate: {
            payload: Joi.object({
              team1: teamSchema,
              team2: teamSchema,
            }),
            failAction: (_request, _h, err) => {
              throw badRequest(err?.message ?? 'Validation failure')
            },
          },
        },
      },
    ])
  },
}

export default pkmPlugin

const idSchema = Joi.number().required().min(1).max(data.pokemon.length)
const teamSchema = Joi.object({
  name: Joi.string().required(),
  pkms: Joi.array().items(idSchema).required(),
})

const typeSchema = Joi.string().valid(...typings)
const pokemonSchema = Joi.object({
  id: Joi.number().integer().required(),
  num: Joi.string().required(),
  name: Joi.string().required(),
  img: Joi.string().uri().required(),
  type: Joi.array().items(typeSchema).min(1).required(),
  height: Joi.string()
    .pattern(/^[0-9.]+\s?m$/)
    .required(),
  weight: Joi.string()
    .pattern(/^[0-9.]+\s?kg$/)
    .required(),
  candy: Joi.string().required(),
  candy_count: Joi.number().integer().optional(),
  egg: Joi.string().valid('Not in Eggs', '2 km', '5 km', '10 km').required(),
  spawn_chance: Joi.number().required(),
  avg_spawns: Joi.number().required(),
  spawn_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$|^N\/A$/)
    .required(),
  multipliers: Joi.array().items(Joi.number()).allow(null).optional(),
  weaknesses: Joi.array().items(typeSchema).min(1).required(),
  prev_evolution: Joi.array()
    .items(
      Joi.object({
        num: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .optional(),
  next_evolution: Joi.array()
    .items(
      Joi.object({
        num: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .optional(),
})
