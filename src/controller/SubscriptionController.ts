import { Response, Request } from 'express';
import { cql } from "../connection/Connection";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';
import { Helper } from '../utils/Helper';

export class SubscriptionController {

    constructor() { }

    public async getById(req: Request, res: Response) {
        let response: any = {};
        let subscriptionId = req.params.id;

        const query: string = `SELECT * FROM apollo_subscriptions where id='${subscriptionId}' ALLOW FILTERING`;

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
                response.data = result.rows;
            }
            
            res.status(response.status).json(response);
        });
    }

    public async create(req: Request, res: Response) {

        let response: any = {};

        const subscriptionsFromApolloIdQuery: string = `SELECT subscriptions FROM apollo_ids WHERE id='${req.body.apollo_id}'`;

        cql.execute(subscriptionsFromApolloIdQuery, (err, result) => {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                response.error = err;
                res.status(response.status).json(response);
                return false; 
            }
            else {
                let newSubscriptions: any;
                let bodyHandler = req.body;

                if (result.rows[0].subscriptions == null) {
                    delete bodyHandler['document'];
                    let arr = [];
                    arr.push(bodyHandler.id);

                    newSubscriptions = JSON.stringify(arr).replace("[", "{").replace("]", "}");
                }
                else {
                    newSubscriptions = Helper.arrayStringFormatHelper(result.rows[0].subscriptions, req.body.id, true);
                }
                console.log(newSubscriptions);

                const updateApolloIdSubscriptionQuery: string = `UPDATE apollo_ids SET subscriptions='${newSubscriptions}' WHERE id='${req.body.apollo_id}'`;
                
                // Update the subscriptions field of apollo_ids
                cql.execute(updateApolloIdSubscriptionQuery, (err) => {

                    if (err != null) {
                        response.status = StatusCode.INTERNAL_SERVER_ERROR;
                        response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                        response.error = err;
                        res.status(response.status).json(response);
                        return false;
                    }
                    else {
                        let subscriptionValues = `'${req.body.id}','${req.body.apollo_id}',dateof(now()),dateof(now()),'${JSON.stringify(req.body.document)}'`;
                        const subscriptionCreateQuery: string = `INSERT INTO apollo_subscriptions(id,apollo_id,created,updated,document) VALUES (${subscriptionValues})`;

                        cql.execute(subscriptionCreateQuery, (err) => {
                            
                            if (err != null) {
                                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                                response.message = StatusMessage.INTERNAL_SERVER_ERROR;
                                response.error = err;
                            }
                            else {
                                response.status = StatusCode.OK;
                                response.message = "Subscription successfully created";
                                response.data = req.body;
                            }
                            res.status(response.status).json(response);
                        });
                    }

                });
            }

        });
    }

    //Updates document only
    public update(req: Request, res: Response) {
        let response: any = {};
        
        const updateQuery: string = `UPDATE apollo_subscriptions SET updated=dateof(now()), document='${JSON.stringify(req.body.document)}' where id='${req.params.id}'`;
        
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
}