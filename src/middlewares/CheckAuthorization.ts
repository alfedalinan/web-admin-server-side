import  { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppConfig } from '../config/AppConfig';
import { mysql } from '../connection/Connection';
import { Helper } from '../utils/Helper';
import { Users } from '../entities/Users';
import { getRepository } from "typeorm";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';

/* Always check for the JSON Web Token for identification */

export const CheckUserPrivileges = async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = req.headers.authorization;

    let payload: any = jwt.verify(accessToken, AppConfig.JwtSecret);
    let response: any = {};

    let requestMethod = req.method;
    let requestOriginalUrl = req.originalUrl;

    let isValid = false;

    let userPattern = /(user)/;
    let userGroupPattern = /(user_group)/;
    let resetPasswordPattern = /(reset)/;

    if (userGroupPattern.test(requestOriginalUrl)) {

    }
    else if (userPattern.test(requestOriginalUrl)) {
        (await mysql).query(`SELECT user_privileges.id, user_privileges.user_privilege 
                                FROM user_groups
                                JOIN user_privileges ON FIND_IN_SET(user_privileges.id, user_groups.privileges) > 0 
                                WHERE user_groups.id=${payload.user_group}`)
                                .then(result => {

                                    switch (requestMethod) {
                                        case "GET":
                                            isValid = Helper.inArrayOfObject("id", 2, result);
                                            break;
                                        case "POST":
                                            isValid = Helper.inArrayOfObject("id", 1, result);
                                            break;
                                        case "PUT":
                                            isValid = Helper.inArrayOfObject("id", 3, result);
                                        case "DELETE":
                                            isValid = Helper.inArrayOfObject("id", 4, result);
                                        default:
                                            isValid = false;
                                            break;
                                    }

                                    if (isValid) {
                                        next();
                                    }
                                    else {
                                        response.status = StatusCode.UNAUTHORIZED;
                                        response.message = StatusMessage.UNAUTHORIZED;
                                        response.error = "Resource access is not allowed for current user group";
                                        res.status(StatusCode.OK).json(response);
                                    }

                                });
        
    }
}