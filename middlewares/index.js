const jwt = require('jsonwebtoken');

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