import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { Users } from "../entities/Users";
import { StatusCode } from "../constants/StatusCode";
import { StatusMessage } from "../constants/StatusMessage";

export class UserController {

    constructior() { }

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
}