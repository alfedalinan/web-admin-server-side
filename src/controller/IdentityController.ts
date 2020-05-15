import { Response, Request } from 'express';
import { cql } from "../connection/Connection";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';
import { Helper } from '../utils/Helper';

export class IdentityController {
    
    constructor() { }
    
    public getById(req: Request, res: Response) {
        let response: any = {};
        let identityId = req.params.id;

        const query: string = `SELECT * FROM apollo_identities where id ='${identityId}' ALLOW FILTERING`;

        cql.execute(query, (err, result) => {
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
                response.data = result.rows.length > 1 ? result.rows : result.rows[0];
            }
            
            res.status(response.status).json(response);
        });
    }

    public create(req: Request, res: Response) {
        let response: any = {};

        const identitiesFromApolloIdQuery: string = `SELECT identities FROM apollo_ids WHERE id='${req.body.apollo_id}'`;

        // get the identities first from apollo_ids table
        cql.execute(identitiesFromApolloIdQuery, (err, result) => {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
                res.status(response.status).json(response);
                return false;
            }
            else {

                let newIdentities: any;
                let bodyHandler = req.body;
                
                if (result.rows[0].identities == null) {
                    delete bodyHandler['document'];
                    let arr = [];
                    arr.push(bodyHandler.id);

                    newIdentities = JSON.stringify(arr).replace("[", "{").replace("]", "}");
                }
                else {
                    newIdentities = Helper.arrayStringFormatHelper(result.rows[0].identities, req.body.id, true);
                }
                console.log(newIdentities);

                const updateApolloIdIdentitiesQuery: string = `UPDATE apollo_ids SET identities='${newIdentities}' WHERE id='${req.body.apollo_id}'`;

                // Update the identities field of apollo_ids
                cql.execute(updateApolloIdIdentitiesQuery, (err) => {

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

                        cql.execute(identityCreateQuery, (err) => {
                            
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
        
        cql.execute(updateQuery, (err, result) => {
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
        cql.execute(identitiesFromApolloIdQuery, (err, result) => {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
                res.status(response.status).json(response);
                return false;
            }
            else {
                
                let newIdentities = Helper.arrayStringFormatHelper(result.rows[0].identities, req.params.id, false);

                const updateApolloIdIdentitiesQuery: string = `UPDATE apollo_ids SET identities='${newIdentities}' WHERE id='${req.body.apollo_id}'`;

                // Update the identities field of apollo_ids
                cql.execute(updateApolloIdIdentitiesQuery, (err) => {

                    if (err != null) {
                        response.status = StatusCode.INTERNAL_SERVER_ERROR;
                        response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                        response.error = err;
                        res.status(response.status).json(response);
                        return false;
                    }
                    else {
                        const identityDeleteQuery: string = `DELETE FROM apollo_identities WHERE id='${req.params.id}'`;

                        cql.execute(identityDeleteQuery, (err) => {
                            
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