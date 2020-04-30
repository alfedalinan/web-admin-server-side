import  { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppConfig } from '../config/AppConfig';
import { createQueryBuilder } from "typeorm";
import { mysql } from '../connection/Connection';
import { Users } from "../entities/Users";
import { UserGroups } from "../entities/UserGroups";
import { UserDomains } from "../entities/UserDomains";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';

/* Always check for the JSON Web Token for identification */

export const CheckAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = req.headers.authorization;
    let payload: any = jwt.verify(accessToken, AppConfig.JwtSecret);

    

    const userDomains = await createQueryBuilder(UserDomains, "user_domains")
                            .select("user_domains.domain")
                            .where("user_domains.id IN (:ids)", { ids: JSON.parse(payload.domains) })
                            .getMany();
        
    console.log(userDomains);

    next();
}