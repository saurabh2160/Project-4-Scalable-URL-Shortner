const urlModel = require('../modules/urlModel')
const redis = require("redis");
const { promisify } = require("util");

const validUrl = require('valid-url')
const shortid = require('shortid');

//Connect to redis=================================================
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
//connection established😮😮😮=================================================



//=======================================================[CREATE SHORT URL]=============================================================
const urlshortner = async (req, res) => {
    try {
        let inurl = req.body
        let { originalUrl } = inurl
        //checking for empty body
        if (Object.keys(inurl).length == 0) return res.status(400).send({ status: false, message: "Enter url in body" })

        //validating url
        if (!validUrl.isUri(originalUrl)) return res.status(400).send({ status: false, message: "Enter a valid url" })
        //creating short url
        let code = shortid.generate().toLowerCase()
        let short = "http://localhost:3000/" + code
        let output = {
            longUrl: originalUrl,
            shortUrl: short,
            urlCode: code
        }
        let search = await urlModel.findOne({ shortUrl: short, urlCode: code })
        //searching for Urlcode and shorturl in DB
        if (search) {
            if (search.urlCode == code) return res.status(400).send({ status: false, message: "urlcode  already exits" })
            if (search.shortUrl == short) return res.status(400).send({ status: false, message: "Shorturl already exits" })
        }
        let findlongurl = await urlModel.findOne({ longUrl: originalUrl }).select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0 })
        if (findlongurl) {
            return res.status(201).send({ status: true,message:"Url already exits in DB", data: findlongurl })
        }
        const result = await urlModel.create(output)
        if (result) {
            res.status(201).send({ status: true, data: output })
        }
    }
    catch (er) {
        res.status(500).send({ status: false, message: er.message })
    }
}
//======================================================[GET URL API]===========================================================================
//🛰🛰🛰Redis calls
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const getUrl = async function (req, res) {
    let code = req.params.urlCode
    let Url = await GET_ASYNC(`${req.params.urlCode}`)
    //console.log(Url)
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






// const getUrl = async function (req, res) {
//     try {
//         let code = req.params.urlCode;

//         const check = await urlModel.findOne({ urlCode: code })
//         // res.writeHead(301, {
//         //     "Location": check.longUrl
//         // });
//         res.status(301).send({status:false,data:check.longUrl})
//         res.end()
//     }
//     catch (er) {
//         res.status(500).send({ status: false, message: er.message })
//     }
// }


module.exports = { urlshortner, getUrl }