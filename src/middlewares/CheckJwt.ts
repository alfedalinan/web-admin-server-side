import  { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppConfig } from '../config/AppConfig';
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';

export const CheckAccessToken = (req: Request, res: Response, next: NextFunction) => {

    const token = <string>req.headers.authorization;
    let payload: any;
    let response: any;

    //Try to validate the token and get data
    try {
        payload = <any>jwt.verify(token, AppConfig.JwtSecret);
        res.locals.jwtPayload = payload;
    } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        response = {
            status: StatusCode.UNAUTHORIZED,
            message: StatusMessage.UNAUTHORIZED,
            data: error
        };

        res.status(StatusCode.UNAUTHORIZED).json(response);
        return;
    }

    //The token is valid for 1 hour
    //We want to send a new token on every request
    // const { id } = payload;
    // const newToken = jwt.sign({ id }, AppConfig.JwtSecret, {
    //     expiresIn: AppConfig.AccessTokenExpiry
    // });
    // res.setHeader("access_token", newToken);

    //Call the next middleware or controller
    next();

}

export const CheckRefreshToken = (req: Request, res: Response, next: NextFunction) => {

    const token = <string>req.headers.authorization;
    let payload: any;
    let response: any;

    //Try to validate the token and get data
    try {
        payload = <any>jwt.verify(token, AppConfig.JwtRefreshSecret);
        res.locals.jwtPayload = payload;
    } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        response = {
            status: StatusCode.UNAUTHORIZED,
            message: StatusMessage.UNAUTHORIZED,
            data: error
        };

        res.status(StatusCode.UNAUTHORIZED).json(response);
        return;
    }

    next();
}