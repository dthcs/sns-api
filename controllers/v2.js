const jwt = require('jsonwebtoken');
const { Domain, User, Post, Hashtag } = require('../models');

exports.createToken = async(req, res) => {
    const { clientSecret } = req.body;
    try{
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attribute: ['nick', 'id'],
            },
        });
        if (!domain){
            return res.status(401).json({
                code: 401,
                message: 'Domain has not been registed. Please register domain first',
            });
        }
        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: '30m',
            issuer: 'sns',
        });
        return res.json({
            code: 200,
            message: 'Token issued',
            token,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Server Error',
        });
    }
};

exports.tokenTest = (req, res) => {
    res.json(res.locals.decoded);
};

exports.getMyPosts = (req, res) => {
    Post.findAll({ where: {userId: res.locals.decoded.id }})
        .then((posts) => {
            console.log(posts);
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: 'server error',
            });
        });
};

exports.getPostsByHashtag = async(req, res) => {
    try{
        const hashtag = await Hashtag.findOne({ where: {title: req.params.title }});
        if(!hashtag){
            return res.status(404).json({
                code: 404,
                message: 'search result not found',
            });
        }
        const posts = await hashtag.getPosts();
        return res.json({
            code: 200,
            payload: posts,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'server error',
        });
    }
};