import { Request, Response } from "express";
import { StatusCode } from "../constants/StatusCode";
import { StatusMessage } from "../constants/StatusMessage";
import { cql, mysql } from "../connection/Connection";
import { JsonWebTokenError } from "jsonwebtoken";
import { Helper } from "../utils/Helper";

export class ApolloIdController {

    constructor() { }

    public async reserve(req: Request, res: Response) {
        let response: any = {};

        const getRandomAIDquery = `SELECT id FROM ApolloIds WHERE status='0' ORDER BY RAND() LIMIT 1`;

        (await mysql)
        .query(getRandomAIDquery)
        .then(result => {
            let id = result[0].id;
            const updateApolloIdStateQuery = `UPDATE ApolloIds SET status='1' WHERE id='${id}'`;
            
            mysql.then(connection => {
                connection.query(updateApolloIdStateQuery)
            });
            let domains = JSON.stringify(["NCE"]);
            let state = "Reserved";

            const reserveApolloIdQuery = `INSERT INTO apollo_ids(id, created, updated, domains, state) 
                                        VALUES('${id}', dateof(now()), dateof(now()), '${domains}', '${state}')`;

            cql.execute(reserveApolloIdQuery, (err, result) => {
            
                if (err != null) {
                    response.status = StatusCode.INTERNAL_SERVER_ERROR;
                    response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                    response.error = err;
                }
                else {
                    response.status = StatusCode.OK;
                    response.message = StatusMessage.OK;
                    response.data = {
                        apollo_id: id,
                        domains: domains,
                        state: state
                    };
                }

                res.status(response.status).json(response);

            });
        });

    }

    public async modify(req: Request, res: Response) {
        let response: any = {};
        let apolloId = req.params.apolloId;
        let state = req.body.state;

        let statePattern = /(Reserved|Active|Inactive)/;

        if (statePattern.test(state)) {

            const modifyApolloIdStatusQuery = `UPDATE apollo_ids SET state='${state}' WHERE id='${apolloId}';`
            
            let apolloExists = await Helper.apolloIdExists(apolloId);

            if (apolloExists) {
                cql.execute(modifyApolloIdStatusQuery, (err, result) => {
                
                    if (err != null) {
                        response.status = StatusCode.INTERNAL_SERVER_ERROR;
                        response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                        response.error = err;
                    }
                    else {
                        response.status = StatusCode.OK;
                        response.message = StatusMessage.OK;
                        response.data = {
                            apollo_id: apolloId,
                            state: state
                        };
                    }
    
                    res.status(response.status).json(response);
    
                });
            }
            else {
                response.status = StatusCode.NOT_FOUND;
                response.message = StatusMessage.NOT_FOUND;
                response.data = `Apollo ID '${apolloId}' not found`;
                res.status(StatusCode.OK).json(response);
            }

        }
        else {
            response.status = StatusCode.BAD_REQUEST;
            response.message = StatusMessage.BAD_REQUEST;
            response.error = "Invalid value of body/payload";
            res.status(response.status).json(response);
        }
    }

    public async inquire(req: Request, res: Response) {
        let response: any = {};
        let apolloId = req.params.apolloId;

        const inquireApolloIdQuery = `SELECT * FROM global_apollo.apollo_ids WHERE id='${apolloId}'`;

        cql.execute(inquireApolloIdQuery)
            .then(result => {
                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = result.rows.length > 1 ? result.rows : result.rows[0] ;
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