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
        const viewKey=`post:${postId}:views`;
        const leaderboardKey="posts:leaderboard"
        const views=await redis.incr(viewKey);
        const leaderboardScore=await redis.zincrby(leaderboardKey, 1, postId)

        return res.json({
            postId,
            views,
            leaderboardScore:Number(leaderboardScore ),
            message:"Post view counted successfully"
        })
    } catch (error) {
        console.error("Error counting post views:", error);

        return res.status(500).json({
            message:"Something went wrong"
        })
    }
})

app.get("/posts/leaderboard", async (req , res)=>{
    try {
        const leaderboardKey="posts:leaderboard";
        const result=await redis.zrevrange(leaderboardKey, 0, 9, "WITHSCORES");
        const leaderboard=[];
        for (let i = 0; i < result.length; i+=2) {
            leaderboard.push({
                rank:i/2 +1,
                postId: Number(result[i]),
                score:Number(result[i+1])
            })
        }

        return res.json({
            leaderboard
        });
    } catch (error) {
        console.error("Error occured:", error);
        return res.status(500).json({
            message:"Something went wrong"
        });
    }
})

app.get("/posts/:postId/rank", async (req , res)=>{
    try {
        const {postId}=req.params;
        const leaderboardKey="posts:leaderboard";
        const redisRank=await redis.zrevrank(leaderboardKey, postId);

        if(redisRank===null){
            return res.status(404).json({
                postId,
                message:"Post not found in leaderboard"
            })
        }

        return res.json({
            postId,
            redisRank,
            actualRank:redisRank+1
        })
    } catch (error) {
        
    }
})

app.listen(PORT, ()=>{
    console.log("Server is running at PORT:", PORT);
})



// INCR      → count views of one post
// ZINCRBY   → increase post score in leaderboard
// ZREVRANGE → show top posts
// ZREVRANK  → show rank of one post