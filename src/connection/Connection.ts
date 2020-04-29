import cassandra = require('cassandra-driver');
import {createConnection} from "typeorm";
import { AppConfig } from '../config/AppConfig';

import { Users } from "../entities/Users";
import { UserGroups } from "../entities/UserGroups";

// MySQL Configuration
export const mysql = createConnection({
    type: "mysql", 
    host: AppConfig.MysqlHost,
    port:  3306, // default port of postgres
    username: AppConfig.MysqlUsername,
    password: AppConfig.MysqlPassword, 
    database: AppConfig.MysqlDatabase, 
    entities: [
       Users,
       UserGroups
    ],
    synchronize: false,
    logging: false
});

// Cassandra configuration
export const connection = new cassandra.Client({ 
    contactPoints: AppConfig.CqlContactPoints, 
    localDataCenter: AppConfig.CqlDataCenters[0], 
    keyspace: AppConfig.CqlKeySpace
});

