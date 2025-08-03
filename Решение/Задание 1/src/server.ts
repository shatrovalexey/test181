import { SearchRoute, User } from './types/query';
import fs from 'fs';
const { HOST, PORT } = require('./config');
import cors from '@fastify/cors';
import Fastify, { FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import { errorRes, successRes } from './utils/response';
import path from 'path';

const fastify = Fastify({ logger: true });

[
    [cors, {
        "origin": "*"
        , "methods": ["GET",]
        ,
    },]
    , [fastifyStatic, {
        "root": path.join(__dirname, "../web")
        , "prefix": "/"
	,}]
    ,
].forEach(([... args]) => fastify.register(... args));

const dataPath = path.join(__dirname, 'data', 'users.json');

fastify.get('/users', (req: FastifyRequest<SearchRoute>, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
        try {
            if (err) throw err;

            return res.type('application/json').send(successRes<User[]>(
                JSON.parse(data)
                    .filter(user => user.name.toLowerCase().includes(req.query.term?.toLowerCase() ?? ''))
            ));
        } catch(exception) {
            fastify.log.error(exception);

            return res.status(500).send(errorRes("Server error"))
        }
    })
});

const start = async () => {
    try {
        await fastify.listen({port: PORT, host: HOST})
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
