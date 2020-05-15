import * as jwt from 'jsonwebtoken';
import { AppConfig } from '../config/AppConfig';

export const CreateAccessJwt = (payload: any) =>  {

    try {
        console.log("payload", payload);
        let jwToken = jwt.sign(payload, AppConfig.JwtSecret, { expiresIn: AppConfig.AccessTokenExpiry });

        return jwToken;

    } catch (error) {
        return error;
    }
}

export const CreateRefreshJwt = (payload: any) => {

    try {
        
        let jwToken = jwt.sign(payload, AppConfig.JwtRefreshSecret, { expiresIn: AppConfig.RefreshTokenExpiry });

        return jwToken;

    } catch (error) {
        return error;
    }
}