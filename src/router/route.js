const express=require('express')
const urlcontrol=require('../urlcontroller/urlController')
const fetch=require('../cahce/auth')
const router=express.Router();

router.post("/url/shorten",urlcontrol.urlshortner)
router.get("/:urlCode",fetch.fetchLongUrl)
//router.get("/:urlCode",urlcontrol.getUrl)


module.exports = router;