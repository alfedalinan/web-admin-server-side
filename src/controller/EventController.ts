import {Request, Response} from 'express';
import {connection} from "../connection/Connection";
import { StatusCode } from '../constants/StatusCode';
import { StatusMessage } from '../constants/StatusMessage';

export class EventController {

    constructor() { }

    public async getAll(req: Request, res: Response) {
        let response: any = {}; // contains { status, data, message } dynamically

        const query = 'SELECT * FROM apollo_events2';

        connection.execute(query, function(err, result) {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;

                res.status(response.status).json(response); 
            }
            else {
                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = result.rows;

                res.status(response.status).json(response);   
            }

        })
    }

    public async getByApolloId(req: Request, res: Response) {
        let response: any = {}; // contains { status, data, message } dynamically
        let apolloId: string = req.params.apolloId

        const query = `SELECT * FROM apollo_events2 WHERE Apollo_Id='${apolloId}'`;

        connection.execute(query, function(err, result) {

            if (err != null) {
                response.status = StatusCode.INTERNAL_SERVER_ERROR;
                response.message = StatusMessage.INTERNAL_SERVER_ERROR;

                res.status(response.status).json(response); 
            }
            else {
                response.status = StatusCode.OK;
                response.message = StatusMessage.OK;
                response.data = result.rows;

                res.status(response.status).json(response);   
            }

        })
    }
}