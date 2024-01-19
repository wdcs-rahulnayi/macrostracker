const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomErrors = require('../errors');
const {createJWT, isTokenValid, attachCookiesToResponse, createTokenUser} = require('../utils');

const register = async (req,res)=>{
    const {name, email, password} = req.body;
    const emailAlreadyExist = await User.findOne({email});
    console.log(emailAlreadyExist);
    if(emailAlreadyExist){
        throw new CustomErrors.BadRequestError('Email Already Exists');
    }

    const user = await User.create({name, email, password});
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser});
    res.status(StatusCodes.CREATED).json({user:tokenUser});
}

const login = async (req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        throw new CustomErrors.BadRequestError('Email and Password Required');
    }
    const user = await User.findOne({email});
    if(!user){
        throw new CustomErrors.UnauthenticatedError('User not found');
    }

    if(!(await user.comparePassword(password))){
        throw new CustomErrors.UnauthenticatedError('Invalid Password');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser});
    res.status(StatusCodes.OK).json({user:tokenUser});
}

const logout = async (req,res)=>{
    res.cookie('token','logout',{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg:'User logged out.'});
}

module.exports = {
    register,
    login,
    logout
}