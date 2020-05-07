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
    let domainGroupPattern = /(domain_group)/;
    let resetPasswordPattern = /(reset)/;

    (await mysql).query(`SELECT user_privileges.id, user_privileges.user_privilege 
                                FROM user_groups
                                JOIN user_privileges ON FIND_IN_SET(user_privileges.id, user_groups.privileges) > 0 
                                WHERE user_groups.id=${payload.user_group}`)
                                .then(result => {
                                    if (userGroupPattern.test(requestOriginalUrl)) {
                                        switch (requestMethod) {
                                            case "GET":
                                                isValid = Helper.inArrayOfObject("id", 7, result);
                                                break;
                                            case "POST":
                                                isValid = Helper.inArrayOfObject("id", 6, result);
                                                break;
                                            case "PUT":
                                                isValid = Helper.inArrayOfObject("id", 8, result);
                                                break;
                                            case "DELETE":
                                                isValid = Helper.inArrayOfObject("id", 9, result);
                                                break;
                                            default:
                                                isValid = false;
                                                break;
                                        }
                                    }
                                    else if (userPattern.test(requestOriginalUrl)) {
                                        switch (requestMethod) {
                                            case "GET":
                                                isValid = Helper.inArrayOfObject("id", 2, result);
                                                break;
                                            case "POST":
                                                isValid = Helper.inArrayOfObject("id", 1, result);
                                                break;
                                            case "PUT":
                                                isValid = Helper.inArrayOfObject("id", 3, result);
                                                break;
                                            case "DELETE":
                                                isValid = Helper.inArrayOfObject("id", 4, result);
                                                break;
                                            default:
                                                isValid = false;
                                                break;
                                        }
                                    }
                                    else if (resetPasswordPattern.test(requestOriginalUrl)) {
                                        isValid = Helper.inArrayOfObject("id", 5, result);
                                    }
                                    else {
                                        isValid = true;
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

export const CheckDomainPrivileges = async (req: Request, res: Response, next: NextFunction) => {
    
}