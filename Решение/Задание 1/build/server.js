"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const { HOST, PORT } = require('./config');
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const response_1 = require("./utils/response");
const path_1 = __importDefault(require("path"));
const fastify = (0, fastify_1.default)({ logger: true });
fastify.register(cors_1.default, {
    origin: '*',
    methods: ['GET'],
});
const dataPath = path_1.default.join(__dirname, 'data', 'users.json');
fastify.get('/', (req, res) => {
    fs_1.default.readFile(dataPath, 'utf8', (err, data) => {
        try {
            if (err) {
                fastify.log.error('File read failed: ' + err);
                return res.code(500).send((0, response_1.errorRes)("Server error"));
            }
            const users = JSON.parse(data);
            const result = users
                .filter((elem) => elem.name.toLowerCase()
                .search(req.query.term?.toLowerCase() ?? '') !== -1);
            return res.type('application/json').send((0, response_1.successRes)(result));
        }
        catch (e) {
            fastify.log.error(e);
            return res.status(500).send((0, response_1.errorRes)("Server error"));
        }
    });
});
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: HOST });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
