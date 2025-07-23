import { createClient } from "redis";
import "dotenv/config.js";

const client = new createClient({
    url: process.env.REDIS_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

client.on("error", function (err) {
    throw err;
});
await client.connect()
await client.set('foo', 'bar');

// Disconnect after usage
//await client.disconnect();

export default client;