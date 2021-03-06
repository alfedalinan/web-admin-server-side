import cassandra = require('cassandra-driver');
import {createConnection} from "typeorm";
import { AppConfig } from '../config/AppConfig';
import { Users } from "../entities/Users";
import { UserGroups } from "../entities/UserGroups";
import { UserPrivileges } from "../entities/UserPrivileges";
import { DomainGroups } from "../entities/DomainGroups";
import { DomainPrivileges } from "../entities/DomainPrivileges";

// MySQL Configuration
export const mysql = createConnection({
    type: "mysql", 
    host: AppConfig.MysqlHost,
    port:  3306, // default port of postgres
    username: AppConfig.MysqlUsername,
    password: AppConfig.MysqlPassword, 
    database: AppConfig.MysqlDatabase,
    connectTimeout: 30000, 
    acquireTimeout: 30000,
    entities: [
       Users,
       UserGroups,
       UserPrivileges,
       DomainGroups,
       DomainPrivileges
    ],
    synchronize: false,
    logging: false
});

// Cassandra configuration
export const cql = new cassandra.Client({ 
    contactPoints: AppConfig.CqlContactPoints, 
    localDataCenter: AppConfig.CqlDataCenters[0], 
    keyspace: AppConfig.CqlKeySpace
});

