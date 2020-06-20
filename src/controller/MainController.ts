import { Request, Response } from "express";

export class MainController {

    constructor() { }

    public async healthCheck(req: Request, res: Response) {

        res.status(200).json({
            status: 200,
            message: "API here! I'm up!"
        })

    }

}