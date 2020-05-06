import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { DomainGroups } from "../entities/DomainGroups";
import { StatusCode } from "../constants/StatusCode";
import { StatusMessage } from "../constants/StatusMessage";
import { mysql } from "../connection/Connection";

export class DomainGroupController {

    constructor() { }

    public async get(req: Request, res: Response) {
        let response: any = {};

        mysql.then(async connection => {

            const domainGroupRepository = connection.getRepository(DomainGroups);
            const domainGroups: DomainGroups[] = await domainGroupRepository.find({ select: ["id", "domain_group"] });

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = domainGroups;
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

        (await mysql).query(`SELECT domain_groups.*, domain_privileges.id as dp_id, domain_privileges.domain_privilege
                            FROM domain_groups 
                            JOIN domain_privileges 
                            ON FIND_IN_SET(domain_privileges.id, domain_groups.domain_privileges) > 0  
                            WHERE domain_groups.id=${req.params.id};`)
                            .then(result => {
                                let data: any = [];
                                for (let index = 0; index < result.length; index++) {
                                    data.push({
                                        id: result[index]['dp_id'],
                                        domain_privilege: result[index]['domain_privilege']
                                    });
                                }

                                let newResponse = result[0];
                                newResponse['privileges_data'] = data;
                                delete newResponse['dp_id'];
                                delete newResponse['domain_privilege'];

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
        
        if (typeof req.body.domain_privileges != "string") {
            req.body.domain_privileges = req.body.domain_privileges.join(',');
        }

        let values = {
            domain_group: req.body.domain_group,
            domain_privileges: req.body.domain_privileges
        };

        try {
            
            await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(DomainGroups)
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
        let domainGroupId = req.params.id;
        let body = req.body;
        let domainGroup = new DomainGroups();

        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                domainGroup[key] = body[key];

                if (key == "domain_privileges" && typeof body[key] != "string") {
                    domainGroup[key] = body[key].join(',');
                }
            }
        }

        mysql.then(async connection => {
            const domainRepository = connection.getRepository(DomainGroups);
            await domainRepository.update(domainGroupId, domainGroup);

            let updatedUserGroups: DomainGroups = await domainRepository.findOne(parseInt(domainGroupId));

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
        let domainGroupId = req.params.id;
        let response: any = {};

        mysql.then(async connection => {

            const userGroupRepository = connection.getRepository(DomainGroups);
            await userGroupRepository.delete(domainGroupId);

            response.status = StatusCode.OK;
            response.message = StatusMessage.OK;
            response.data = "Domain Group has been removed successfully";

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