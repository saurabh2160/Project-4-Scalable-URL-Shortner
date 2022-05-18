
const urlModel = require("../modules/urlModel");
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    13633,
    "redis-13633.c81.us-east-1-2.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("zXGz6mWeXy0mZfKALK3pV15u7seerWf5", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const fetchLongUrl = async function (req, res) {
    let code = req.params.urlCode
    let Url = await GET_ASYNC(`${req.params.urlCode}`)
    console.log(Url)
    if (!Url) {
        let checkdb = await urlModel.findOne({ urlCode: code });
        //console.log(checkdb)
        if (!checkdb) return res.status(404).send({ status: false, message: "No url found with that code" })
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(checkdb.longUrl))
        console.log("hello from DB")
        return res.redirect(checkdb.longUrl)
        //res.status(301).send({ status: true, msg: "im !url", data: checkdb.longUrl });
    }
    console.log("hello from redis")
    return res.redirect(Url) 
    //return res.status(301).send({ status: true, msg: "i am from here", data: Url })

};

module.exports.fetchLongUrl = fetchLongUrl