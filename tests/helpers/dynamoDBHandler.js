import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { awsCreds, configTableName, ingestTableName } from '../fixtures/envCreds'

let docClient = DynamoDBDocument.from(new DynamoDB({ 
    region: 'eu-west-1',
    credentials: awsCreds
 }))

export async function deleteItem(value) {
    docClient
        .delete({
            TableName: ingestTableName,
            Key: {
                PK: value,
                SK: 1
            }
        })
        //.then(data => console.log(data.Attributes))
        .catch(console.error)
}

// get latest dataset or transform config version from the database
// not currently in use as same details are available via Dataset API calls but code may be useful as template in future
export async function getVersion(value, table) {
    return new Promise(function(resolve) {
        docClient
            .query({
                TableName: table,
                KeyConditionExpression: 'PK = :id',
                ExpressionAttributeValues: {
                    ':id': value
                },
                Key: { 
                    PK: value
                },
                ScanIndexForward: false,
                Limit: 1
            })
            .then(data => {
                console.log(data.Items)
                if (table === configTableName) {
                    resolve(data.Items[0].latest_version) // transform config version
                } else {
                    resolve(data.Items[0].SK) // dataset version
                }
            })
            .catch(console.error)
    })
}
