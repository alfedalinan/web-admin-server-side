import { Response, Request } from 'express';
import { connection } from "../connection/Connection";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';
import { Helper } from '../utils/Helper';

export class IdentityController {
    
    constructor() { }
    

    public getById(req: Request, res: Response) {
        let response: any = {};
        let identityId = req.params.id;

        const query: string = `SELECT * FROM apollo_identities where id ='${identityId}' ALLOW FILTERING`;

        connection.execute(query, (err, result) => {
            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
            }
            else {

                for (let index = 0; index < result.rows.length; index++) {
                    result.rows[index].document = JSON.parse(result.rows[index].document);
                }

                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = result.rows;
            }
            
            res.status(response.status).json(response);
        });
    }

    public create(req: Request, res: Response) {
        let response: any = {};

        const identitiesFromApolloIdQuery: string = `SELECT identities FROM apollo_ids WHERE id='${req.body.apollo_id}'`;

        // get the identities first from apollo_ids table
        connection.execute(identitiesFromApolloIdQuery, (err, result) => {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
                res.status(response.status).json(response);
                return false;
            }
            else {

                let newIdentities = Helper.arrayStringHelper(result, req.body.id, true);

                const updateApolloIdIdentitiesQuery: string = `UPDATE apollo_ids SET identities='${newIdentities}' WHERE id='${req.body.apollo_id}'`;
                
                // Update the identities field of apollo_ids
                connection.execute(updateApolloIdIdentitiesQuery, (err) => {

                    if (err != null) {
                        response.status = StatusCode.INTERNAL_SERVER_ERROR;
                        response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                        response.error = err;
                        res.status(response.status).json(response);
                        return false;
                    }
                    else {
                        let identityValues = `'${req.body.id}','${req.body.apollo_id}',dateof(now()),dateof(now()),'${JSON.stringify(req.body.document)}'`;
                        const identityCreateQuery: string = `INSERT INTO apollo_identities(id,apollo_id,created,updated,document) VALUES (${identityValues})`;

                        connection.execute(identityCreateQuery, (err) => {
                            
                            if (err != null) {
                                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                                response.error = err;
                            }
                            else {
                                response.status = StatusCode.OK;
                                response.message = "Identity successfully created";
                                response.data = req.body;
                            }
                            res.status(response.status).json(response);
                        });
                    }

                });
            }

        });
        
    }

    public update(req: Request, res: Response) {
        let response: any = {};
        
        const updateQuery: string = `UPDATE apollo_identities SET updated=dateof(now()), document='${JSON.stringify(req.body.document)}' where id='${req.params.id}'`;
        
        connection.execute(updateQuery, (err, result) => {
            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
            }
            else {
                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = req.body;
            }

            res.status(response.status).json(response);
        });
    }

    public remove(req: Request, res: Response) {
        let response: any = {};

        const identitiesFromApolloIdQuery: string = `SELECT identities FROM apollo_ids WHERE id='${req.body.apollo_id}'`;

        // get the identities first from apollo_ids table
        connection.execute(identitiesFromApolloIdQuery, (err, result) => {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
                res.status(response.status).json(response);
                return false;
            }
            else {
                
                let newIdentities = Helper.arrayStringHelper(result, req.params.id, false);

                const updateApolloIdIdentitiesQuery: string = `UPDATE apollo_ids SET identities='${newIdentities}' WHERE id='${req.body.apollo_id}'`;

                // Update the identities field of apollo_ids
                connection.execute(updateApolloIdIdentitiesQuery, (err) => {

                    if (err != null) {
                        response.status = StatusCode.INTERNAL_SERVER_ERROR;
                        response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                        response.error = err;
                        res.status(response.status).json(response);
                        return false;
                    }
                    else {
                        const identityDeleteQuery: string = `DELETE FROM apollo_identities WHERE id='${req.params.id}'`;

                        connection.execute(identityDeleteQuery, (err) => {
                            
                            if (err != null) {
                                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                                response.error = err;
                            }
                            else {
                                response.status = StatusCode.OK;
                                response.message = "Identity successfully removed";
                                response.data = req.body;
                            }
                            res.status(response.status).json(response);
                        });
                    }

                });
            }

        });
    }
}