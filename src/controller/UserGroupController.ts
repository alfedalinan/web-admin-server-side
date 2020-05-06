import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { UserGroups } from "../entities/UserGroups";
import { StatusCode } from "../constants/StatusCode";
import { StatusMessage } from "../constants/StatusMessage";
import { mysql } from "../connection/Connection";

export class UserGroupController {

    constructor() { }

    public async get(req: Request, res: Response) {
        let response: any = {};

        mysql.then(async connection => {

            const userGroupRepository = connection.getRepository(UserGroups);
            const userGroups: UserGroups[] = await userGroupRepository.find({ select: ["id", "title"] });

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = userGroups;
            res.status(StatusCode.OK).json(response);

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

        (await mysql).query(`SELECT user_groups.*, user_privileges.id AS up_id, user_privileges.user_privilege
                            FROM user_groups 
                            JOIN user_privileges ON FIND_IN_SET(user_privileges.id, user_groups.privileges) > 0 
                            WHERE user_groups.id=${req.params.id};`)
                            .then(result => {
                                let data: any = [];
                                for (let index = 0; index < result.length; index++) {
                                    data.push({
                                        id: result[index]['up_id'],
                                        user_privilege: result[index]['user_privilege']
                                    });
                                }

                                let newResponse = result[0];
                                newResponse['privileges_data'] = data;
                                delete newResponse['up_id'];
                                delete newResponse['user_privilege'];

                                response = {
                                    status: StatusCode.OK,
                                    message: StatusMessage.OK,
                                    data: newResponse
                                };
                                res.status(StatusCode.OK).json(response);
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
        
        if (typeof req.body.privileges != "string") {
            req.body.privileges = req.body.privileges.join(',');
        }

        let values = {
            title: req.body.title,
            privileges: req.body.privileges
        };

        try {
            
            await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(UserGroups)
                    .values([values])
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
        let userGroupId = req.params.id;
        let body = req.body;
        let userGroup = new UserGroups();

        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                userGroup[key] = body[key];

                if (key == "privileges" && typeof body[key] != "string") {
                    userGroup[key] = body[key].join(',');
                }

            }
        }

        mysql.then(async connection => {
            const userRepository = connection.getRepository(UserGroups);
            await userRepository.update(userGroupId, userGroup);

            let updatedUserGroups: UserGroups = await userRepository.findOne(parseInt(userGroupId));

            response = {
                status: StatusCode.OK,
                message: StatusMessage.OK,
                data: updatedUserGroups
            };
            res.status(StatusCode.OK).json(response);
        })
        .catch(error => {
            response = {
                status: StatusCode.INTERNAL_SERVER_ERROR,
                message: StatusMessage.INTERNAL_SERVER_ERROR,
                error: error
            };
            res.status(response.status).json(response);
        });
    }

    public async remove(req: Request, res: Response) {
        let userGroupId = req.params.id;
        let response: any = {};

        mysql.then(async connection => {

            const userGroupRepository = connection.getRepository(UserGroups);
            await userGroupRepository.delete(userGroupId);

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = "User Group has been removed successfully";

            res.status(response.status).json(response);

        })
        .catch(error => {

            response.status = StatusCode.INTERNAL_SERVER_ERROR;
            response.message = StatusMessage.INTERNAL_SERVER_ERROR;
            response.error = error;

            res.status(response.status).json(response);

        });
    }
}