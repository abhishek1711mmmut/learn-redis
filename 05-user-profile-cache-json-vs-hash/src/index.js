import express, { json } from "express";
import Redis from "ioredis";

const app=express();
app.use(express.json());

const redis=new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post("/user/:id/json", async (req, res)=>{
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
    return res.json({savedAs:"json"});
});

app.get("/user/:id/json", async (req, res)=>{
    console.log("object1");
    const raw=await redis.get(`user:${req.params.id}:json`);
    console.log(raw);
    return res.json({user:raw? JSON.parse(raw): null});
});

app.post("/user/:id/hash", async (req, res)=>{
    const user=await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({savedAs:"hash"});
});

app.get("/user/:id/hash", async (req, res)=>{
    const user=await redis.hgetall(`user:${req.params.id}:hash`);
    return res.json({user});
})

app.listen(3000, ()=>{
    console.log("Server is running at http:localhost:3000");
})