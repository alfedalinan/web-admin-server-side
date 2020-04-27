import {Request, Response} from 'express';
import {mysql} from "../connection/Connection";
import {StatusCode} from '../constants/StatusCode';
import {StatusMessage} from '../constants/StatusMessage';
import { CreateAccessJwt, CreateRefreshJwt } from '../middlewares/CreateJwt';
import { Users } from '../entities/Users';

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
                res.status(response.status).json(response);
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

                    res.status(response.status).json(response); 
                    return;
                }
                else {
                    // Successful login

                    //Create new JW Token here (with parameters of users.id and users.username)
                    let accessToken: string = CreateAccessJwt({ id: Date.now() });
                    let refreshToken: string = CreateRefreshJwt({ id: Date.now() });

                    // let users = await createQueryBuilder(Users, "users")
                    //                 .innerJoinAndSelect("users.access_type", "user_types")
                    //                 .where("users.id = :id", { id: user.id })
                    //                 .getOne();

                    var includeKeys = ["id", "username",
                        "first_name", "last_name", "email", "created", "user_type"];

                    for (const key in user) {
                        if (!includeKeys.includes(key)) {
                            delete user[key];
                        }
                    }
                    
                    user['access_token'] = accessToken;
                    user['refresh_token'] = refreshToken;

                    response.status = StatusCode.OK;
                    response.message = StatusMessage.OK;
                    response.data = user;
        
                    res.status(response.status).json(response);
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

            res.status(response.status).json(response)
        } catch (error) {
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;

            res.status(response.status).json(response);
        }
    }

    public async logout(req: Request, res: Response) {

        let response: any = {};

        response.status = StatusCode.OK;
        response.message = "Successfully logged out!";
        
        res.status(response.status).json(response);

    }
}