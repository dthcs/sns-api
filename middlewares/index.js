const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { Domain } = require('../models');

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send('Please Login');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        next();
    }else{
        const message = encodeURIComponent('Login State');
        res.redirect(`/?error=${message}`);
    }
};

exports.verifyToken = (req, res, next) => {
    try{
        res.locals.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    }catch(error){
        if(error.name == 'TokenExpiredError'){
            return res.status(419).json({
                code: 419,
                message: "Token expired",
            });
        }
        return res.status(401).json({
            code: 401,
            message: "Invalid Token",
        });
    }
};

exports.apiLimiter = rateLimit({
    windowMs: 60*1000, //1 minute
    max: 2,
    handler(req, res){
        res.status(this.statusCode).json({
            code: this.statusCode,
            message: "access within 1 minute only",
        });
    },
});

exports.deprecated = (req, res) => {
    res.status(410).json({
        code: 410,
        message: 'new version issued. Please use new version',
    });
};

exports.corsWhenDomainMatches = async(req, res, next) => {
    const domain = await Domain.findOne({
        where: { host: new URL(req.get('origin')).host },
    });
    if(domain){
        cors({
            origin: req.get('origin'),
            credentials: true,
        })(req, res, next);
    }else{
        next();
    }
};