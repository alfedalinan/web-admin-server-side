import * as express from 'express'
import { Routes } from "./routes/Routes";
import bodyParser = require("body-parser");
import * as helmet from 'helmet';
import * as cors from 'cors';

class App {
    public app: express.Application;
    public routePrv: Routes;
    
    constructor() {
    // initializing express in this application
        this.app = express();
    // support application/json type post data
        this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

        // cors and helmet
        this.app.use(cors());
        this.app.use(helmet());

    // for routing the http request to controller
        this.routePrv = new Routes();

        this.routePrv.routes(this.app);
    }
}
export default new App().app;