import {Request, Response} from 'express';
import {mysql} from "../connection/Connection";
import { createQueryBuilder } from "typeorm";
import {StatusCode} from '../constants/StatusCode';
import {StatusMessage} from '../constants/StatusMessage';
import { CreateAccessJwt, CreateRefreshJwt } from '../middlewares/CreateJwt';
import { Users } from '../entities/Users';
import { DomainGroups } from '../entities/DomainGroups';
import { UserPrivileges } from '../entities/UserPrivileges';
import { DomainPrivileges } from '../entities/DomainPrivileges';

export class AuthController {

    constructor() { }

    public async login(req: Request, res: Response) {
        let response: any = {}; // contains { status, data, message } dynamically

        // Decipher of hashed timestamp
        // let hashText = req.body.hash;
        // let hashTextParts = hashText.split(':');
        // let hashIv = hashTextParts[0];
        // let encryptedHash = hashTextParts[1];
        // let decipheredHash = Helper.decipherPassword(AppConfig.CryptoAlgorithm, hashIv, AppConfig.EncryptionKey, encryptedHash);

        // let loginTime = parseInt(decipheredHash);
        // let expiryTime = Math.floor(new Date().getTime() / 1000) + 30; // + 30 seconds validity

        // If loginTime passed 20 seconds validity
        // if (expiryTime >= loginTime) {
        //     response.status = StatusCode.UNAUTHORIZED;
        //     response.message = StatusCode.UNAUTHORIZED;
        //     response.data = [];

        //     res.status(response.status).json(response); 
        //     return;
        // }

        // Manager decipher of login credentials here
        // let text = req.body.password;
        // let textParts = text.split(':');
        // let iv = textParts[0];
        // let encryptedText = textParts[1];
        // let decipheredLoginPass = Helper.decipherPassword(AppConfig.CryptoAlgorithm, iv, AppConfig.EncryptionKey, encryptedText);

        mysql.then(async connection => {

            const userRepository = connection.getRepository(Users);
            const user: Users = await userRepository.findOne({ username: req.body.username});

            // User is not found (404)
            if (user == null) {
                response.status = StatusCode.NOT_FOUND;
                response.message = StatusMessage.NOT_FOUND;
                response.data = [];
                res.status(StatusCode.OK).json(response);
                return;
            }
            else {
                
                // let storedText = user.password;
                // let storedTextParts = storedText.split(':');
                // let storedIv = storedTextParts[0];
                // let storedPassword = storedTextParts[1];
                // let decipheredRegPass = Helper.decipherPassword(AppConfig.CryptoAlgorithm, storedIv, AppConfig.EncryptionKey, storedPassword);

                // if (decipheredRegPass != decipheredLoginPass) {
                if (req.body.password != user.password) {
                    // Password is incorrect

                    response.status = StatusCode.UNAUTHORIZED;
                    response.message = "Password was incorrect";
                    response.data = [];

                    res.status(StatusCode.OK).json(response); 
                    return;
                }
                else {
                    // Successful login

                    //Create new JW Token here (with parameters of users.id and users.username)
                    let accessToken: string = CreateAccessJwt({ id: user.id, username: user.username, user_group: user.user_group, domains: user.domain_group });
                    let refreshToken: string = CreateRefreshJwt({ id: user.id, username: user.username, user_group: user.user_group, domains: user.domain_group });

                    let userUpdate: Users = new Users();
                    userUpdate.token = accessToken;
                    await userRepository.update(user.id, userUpdate);

                    let users = await createQueryBuilder(Users, "users")
                                    .innerJoinAndSelect("users.user_groups", "user_groups")
                                    .where("users.id = :id", { id: user.id })
                                    .getOne();

                    users['user_groups']['user_privileges'] = await createQueryBuilder(UserPrivileges, "user_privileges")
                                                                .where("user_privileges.id IN (:ids)", { ids: users['user_groups']['privileges'].split(',') })
                                                                .getMany();
                    
                    users['domain_groups'] = await createQueryBuilder(DomainGroups, "domain_groups")
                                            .where("domain_groups.id IN (:ids)", { ids: users['domain_group'].split(',') })
                                            .getMany();

                    for (let i = 0; i < users['domain_groups'].length; i++) {
                        users['domain_groups'][i]['privileges'] = await createQueryBuilder(DomainPrivileges, "domain_privileges")
                                                                        .where("domain_privileges.id IN (:ids)", 
                                                                        { ids: users['domain_groups'][i]['domain_privileges'].split(',') })
                                                                        .getMany();
                    }

                    delete users['token'];
                    delete users['password'];

                    users['access_token'] = accessToken;
                    users['refresh_token'] = refreshToken;

                    response.status = StatusCode.OK;
                    response.message = StatusMessage.OK;
                    response.data = users;
        
                    res.status(StatusCode.OK).json(response);
                }
            }
        })
        .catch(error => {
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;

            res.status(response.status).json(response);
        });
    }

    public async refreshToken(req: Request, res: Response) {
        let response: any = {};
        let body = req.body;
        
        try {
            let accessToken = CreateAccessJwt({ id: Date.now() });

            let tokens = accessToken;

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.access_token = tokens;

            res.status(StatusCode.OK).json(response)
        } catch (error) {
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;

            res.status(StatusCode.OK).json(response);
        }
    }

    public async logout(req: Request, res: Response) {

        let response: any = {};

        response.status = StatusCode.OK;
        response.message = "Successfully logged out!";
        
        res.status(response.status).json(response);

    }
}