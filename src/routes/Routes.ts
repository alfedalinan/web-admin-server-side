import {Request, Response} from "express";
// Everytime you create controllers, you add them here
import {AuthController} from "../controller/AuthController";
import { EventController } from "../controller/EventController";
import { UserController } from "../controller/UserController";
import { UserGroupController } from "../controller/UserGroupController";
import { DomainGroupController } from "../controller/DomainGroupController";
import { ApolloIdController } from "../controller/ApolloIdController";
import { SubscriptionController } from "../controller/SubscriptionController";
import { IdentityController } from "../controller/IdentityController";

// Middleware imports
import { CheckAccessToken, CheckRefreshToken } from "../middlewares/CheckJwt";
import { CheckUserPrivileges, CheckDomainPrivileges } from "../middlewares/CheckAuthorization";



class Routes {
    // Every controllers to be registered in routes must be declared here:
    private auth: AuthController;
    private event: EventController;
    private user: UserController;
    private userGroup: UserGroupController;
    private domainGroup: DomainGroupController;
    private apolloId: ApolloIdController;
    private subscription: SubscriptionController;
    private identity: IdentityController;

    constructor() {
        // Every controllers to be registered in routes must have an instance here:
        this.auth = new AuthController();
        this.event = new EventController();
        this.user = new UserController();
        this.userGroup = new UserGroupController();
        this.domainGroup = new DomainGroupController();
        this.apolloId = new ApolloIdController();
        this.subscription = new SubscriptionController();
        this.identity = new IdentityController();
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

        
        //#region Apollo ID 
        app.route('/apollo_id')
            .post([CheckDomainPrivileges], this.apolloId.reserve)
        
        app.route('/apollo_id/:apolloId')
            .get([CheckDomainPrivileges], this.apolloId.inquire)
            .put([CheckDomainPrivileges], this.apolloId.modify)

        //#endregion

        //#region subscription

        app.route('/subscriptions')
            .post(this.subscription.create)
        
        app.route('/subscriptions/:apolloId')
            .get(this.subscription.getById)
        
        //#endregion

        //#region 
        
        app.route('/identities')
            .post(this.identity.create)
        
        app.route('/identities/:id')
            .get(this.identity.getById)

        
    }
}
export {Routes};