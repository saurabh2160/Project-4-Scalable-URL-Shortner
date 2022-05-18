const urlModel = require('../modules/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid');


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
const getUrl = async function (req, res) {
    try {
        let code = req.params.urlCode;

        const check = await urlModel.findOne({ urlCode: code })
        // res.writeHead(301, {
        //     "Location": check.longUrl
        // });
        res.status(301).send({status:false,data:check.longUrl})
        res.end()
    }
    catch (er) {
        res.status(500).send({ status: false, message: er.message })
    }
}


module.exports = { urlshortner, getUrl }