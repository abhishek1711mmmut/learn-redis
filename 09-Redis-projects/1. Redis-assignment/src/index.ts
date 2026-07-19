import express from "express"
import Redis from "ioredis"

const app=express();
app.use(express.json());

const PORT=3000;

const redis=new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on("connect", ()=>{
    console.log("connected to redis");
});

redis.on("error", (error)=>{
    console.error("Redis error:", error);
})

app.get("/", async (req , res)=>{
    return res.json({
        msg:"Redis post views project is running"
    })
})



// 
app.get("/posts/:postId/view", async (req, res)=>{
    try {
        const postId=req.params.postId;
        const redisKey=`post:${postId}:views`;
        const views=await redis.incr(redisKey);

        return res.json({
            postId,
            views,
            message:"Post view count successfully"
        })
    } catch (error) {
        console.error("Error counting post views:", error);

        return res.status(500).json({
            message:"Something went wrong"
        })
    }
})

app.listen(PORT, ()=>{
    console.log("Server is running at PORT:", PORT);
})