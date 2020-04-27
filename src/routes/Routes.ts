import {Request, Response} from "express";
// Everytime you create controllers, you add them here
import {AuthController} from "../controller/AuthController";
import { EventController } from "../controller/EventController";
import { UserController } from "../controller/UserController";
import { IdentityController } from "../controller/IdentityController";
import { CheckAccessToken, CheckRefreshToken } from "../middlewares/CheckJwt";



class Routes {
    // Every controllers to be registered in routes must be declared here:
    private auth: AuthController;
    private event: EventController;
    private identity: IdentityController;
    private user: UserController;

    constructor() {
        // Every controllers to be registered in routes must have an instance here:
        this.auth = new AuthController();
        this.event = new EventController();
        this.identity = new IdentityController();
        this.user = new UserController();
    }

    public routes(app): void {
        
        // #region Auth section
        app.route('/auth/login')
            .post(this.auth.login)
        
        app.route('/auth/refresh_token')
            .post([CheckRefreshToken], this.auth.refreshToken)

        app.route('/logout')
            .get(this.auth.logout)

        //#endregion

        // #region User

        app.route('/user')
            .post(this.user.create)

        // #endregion
        
        //#region Event
        app.route('/event')
            .get([CheckAccessToken], this.event.getAll)
        
        app.route('/event/:apolloId')
            .get([CheckAccessToken], this.event.getByApolloId)

        // #endregion

    }
}
export {Routes};