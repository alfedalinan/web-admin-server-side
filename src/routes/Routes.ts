import {Request, Response} from "express";
// Everytime you create controllers, you add them here
import {AuthController} from "../controller/AuthController";
import { EventController } from "../controller/EventController";
import { UserController } from "../controller/UserController";
import { UserGroupController } from "../controller/UserGroupController";
import { DomainGroupController } from "../controller/DomainGroupController";
import { CheckAccessToken, CheckRefreshToken } from "../middlewares/CheckJwt";
import { CheckUserPrivileges } from "../middlewares/CheckAuthorization";



class Routes {
    // Every controllers to be registered in routes must be declared here:
    private auth: AuthController;
    private event: EventController;
    private user: UserController;
    private userGroup: UserGroupController;
    private domainGroup: DomainGroupController;

    constructor() {
        // Every controllers to be registered in routes must have an instance here:
        this.auth = new AuthController();
        this.event = new EventController();
        this.user = new UserController();
        this.userGroup = new UserGroupController();
        this.domainGroup = new DomainGroupController();
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
            .get([CheckAccessToken, CheckUserPrivileges], this.user.get)
            .post([CheckAccessToken, CheckUserPrivileges], this.user.create)
        
        app.route('/user/:id')
            .get([CheckAccessToken, CheckUserPrivileges], this.user.getById)
            .put([CheckAccessToken, CheckUserPrivileges], this.user.update)
            .delete([CheckAccessToken, CheckUserPrivileges], this.user.remove)

        app.route('/reset_password/:id')
            .put([CheckAccessToken, CheckUserPrivileges], this.user.resetPassword)

        // #endregion
        
        //#region UserGroup
        app.route('/user_group')
            .get([CheckAccessToken, CheckUserPrivileges], this.userGroup.get)
            .post([CheckAccessToken, CheckUserPrivileges], this.userGroup.create)

        app.route('/user_group/:id')
            .get([CheckAccessToken, CheckUserPrivileges], this.userGroup.getById)
            .put([CheckAccessToken, CheckUserPrivileges], this.userGroup.update)
            .delete([CheckAccessToken, CheckUserPrivileges], this.userGroup.remove)

        //#endregion

        app.route('/domain_group')
            .get([CheckAccessToken, CheckUserPrivileges], this.domainGroup.get)
            .post([CheckAccessToken, CheckUserPrivileges], this.domainGroup.create)

        app.route('/domain_group/:id')
            .get([CheckAccessToken, CheckUserPrivileges], this.domainGroup.getById)
            .put([CheckAccessToken, CheckUserPrivileges], this.domainGroup.update)
            .delete([CheckAccessToken, CheckUserPrivileges], this.domainGroup.remove)


        //#region Event
        app.route('/event')
            .get([CheckAccessToken], this.event.getAll)
        
        app.route('/event/:apolloId')
            .get([CheckAccessToken], this.event.getByApolloId)

        // #endregion

    }
}
export {Routes};