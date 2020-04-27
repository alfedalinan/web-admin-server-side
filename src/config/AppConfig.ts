

export const AppConfig = {
    // JWT Configuration
    JwtSecret: "e447a7e9e3e4028e70e35406d9d0581cbe244aedf46ec7212443217051d7fbc4",
    JwtRefreshSecret: "bf1cb4c30f65d658b283ee805714f08f9a7fc0c6141d2c8114fd1951200a8d89",
    AccessTokenExpiry: "1h",
    RefreshTokenExpiry: "8h",

    // Cryptographic Security Configuration
    CryptoAlgorithm: "aes-128-cbc",
    BufferLength: 16,
    EncryptionKey: "e73e8c3135d3cfa5",
    // RegisterEncryptionKey: "50f7ecaa2deb6b87",
    // LoginIV: "8878fc647333e59c",
    InitializationVector: "4ad4b56b0ebfaaba",

    // Cassandra Database Configuration
    CqlContactPoints: ['192.168.50.7'],
    CqlDataCenters: ['datacenter1'],
    CqlKeySpace: 'global_apollo',
    
    // Mysql Database Configuration
    MysqlHost: 'localhost',
    MysqlUsername: 'root',
    MysqlPassword: '',
    MysqlDatabase: 'apollo',
}