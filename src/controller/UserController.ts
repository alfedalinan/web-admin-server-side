import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { Users } from "../entities/Users";
import { StatusCode } from "../constants/StatusCode";
import { StatusMessage } from "../constants/StatusMessage";
import { mysql } from "../connection/Connection";

export class UserController {

    constructior() { }

    public async get(req: Request, res: Response) {
        let response: any = {};

        mysql.then(async connection => {

            const userRepository = connection.getRepository(Users);
            const user: Users[] = await userRepository.find({
                select: ["id", "username", "email", "first_name", "last_name", "access_type", "created"]
            });

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = user;
            res.status(response.status).json(response);
        })
        .catch(error => {
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.error = error;
            res.status(response.status).json(response);
        });
    }

    public async getById(req: Request, res: Response) {
        let response: any = {};
        let userId = req.params.id;

        mysql.then(async connection => {

            const userRepository = connection.getRepository(Users);
            const user: Users = await userRepository.findOne(parseInt(userId), {
               select: ["id", "first_name", "last_name", "username", "user_type", "created"] 
            });

            if (user) {
                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = user;
            }
            else {
                // No Content/Not Found
                response.status = StatusCode.NOT_FOUND;
                response.message = StatusMessage.NOT_FOUND;
            }

            res.status(response.status).json(response);
        })
        .catch(error => {
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;
            res.status(response.status).json(response);
        });
    }

    public async create(req: Request, res: Response) {
        // user_type, username, password, first_name, last_name
        let response: any = {};
        let values = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            user_type: req.body.user_type,
            password: req.body.password
        };

        try {
            
            await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Users)
                    .values([req.body])
                    .execute();

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = req.body;

        } catch (error) {
            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.error = error;
        }

        res.status(response.status).json(response);
    }

    public async update(req: Request, res: Response) {
        let response: any = {};
        let userId = req.params.id;
        let body = req.body;
        let user = new Users();

        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                user[key] = body[key];
            }
        }

        mysql.then(async connection => {

            const userRepository = connection.getRepository(Users);
            await userRepository.update(userId, user);

            let updatedUser: Users = await userRepository.findOne(parseInt(userId), 
                { select: ["id", "first_name", "last_name", "username", "password", "created", "user_type"]});

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = updatedUser;
            res.status(response.status).json(response);
        })
        .catch(error => {
            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;
            res.status(response.status).json(response);
        });
    }

    public async remove(req: Request, res: Response) {
        let userId = req.params.id;
        let response: any = {};

        mysql.then(async connection => {

            const userRepository = connection.getRepository(Users);
            await userRepository.delete(userId);

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = "User has been removed successfully";

            res.status(response.status).json(response);

        })
        .catch(error => {

            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;

            res.status(response.status).json(response);

        })
    }
}