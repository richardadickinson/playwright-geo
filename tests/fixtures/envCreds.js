const awsCreds = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
}

let extractAPIToken = process.env.API_TOKEN
let tprdIngestHostname
let extractHostname
let ingestTableName
let configTableName

switch (process.env.ENVIRONMENT) {
    case 'dev':
        extractHostname = 'https://api.geo.dev.adp.arup.com'
        tprdIngestHostname = 'https://api.internal.gdam.dev.adp.arup.com'
        ingestTableName = 'adp-geodataingest-dev-datasets'
        configTableName = 'adp-geo-transform-dev-config'
        break
    case 'qa':
        extractHostname = 'https://api.geo.qa.adp.arup.com'
        tprdIngestHostname = 'https://api.internal.gdam.qa.adp.arup.com'
        ingestTableName = 'adp-geodataingest-qa-datasets'
        configTableName = 'adp-geo-transform-qa-config'
        break
    case 'preprod':
        extractHostname = 'https://api.geo.preprod.adp.arup.com'
        tprdIngestHostname = 'https://api.internal.gdam.preprod.adp.arup.com'
        ingestTableName = 'adp-geodataingest-preprod-datasets'
        configTableName = 'adp-geo-transform-preprod-config'
        break
    default:
        // use for local runs
        extractHostname = 'https://api.geo.dev.adp.arup.com'
        tprdIngestHostname = 'https://api.internal.gdam.dev.adp.arup.com'
        ingestTableName = 'adp-geodataingest-dev-datasets'
        configTableName = 'adp-geo-transform-dev-config'
}

export { awsCreds, extractAPIToken, tprdIngestHostname, ingestTableName, configTableName, extractHostname }