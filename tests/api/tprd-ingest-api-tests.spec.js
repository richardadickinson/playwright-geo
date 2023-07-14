import { test, expect } from '@playwright/test'
import { sendGETRequest, sendPOSTRequest } from '../helpers/signedRequestHandler'
import { configsSchema } from '../fixtures/transformConfigsSchema'
import { configResponseSchema } from '../fixtures/configResponseSchema'
import { validateJSONSchema } from '../helpers/jsonValidator'
import { deleteItem } from '../helpers/dynamoDBHandler'
import { tprdIngestHostname as host } from '../fixtures/envCreds'

const sleep = milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)

test.describe('Test TPRD Transform ingest API', () => {

    test('should get TPRD API version', async ({ }) => {
        let apiUrl = new URL(`${host}/version/transform`)
        const response = await sendGETRequest(apiUrl)
        expect(response.status).toBe(200)
        console.log('Received data: ', response.data)
        expect(JSON.stringify(response.data)).toContain('version')
    })

    test('should get all TPRD transform configs', async ({ }) => {
        let apiUrl = new URL(`${host}/transform/configs`)
        const response = await sendGETRequest(apiUrl)
        console.log('Received data:\r\n', response.data)
        expect(response.status).toBe(200)    
        expect(validateJSONSchema(configsSchema, response.data)).toBeTruthy()
    })

    test('should get latest version of transform config by ID', async ({}) => {
        let transformId = '6ba94d94-3799-4233-9a2d-b2032e205402'
        let apiUrl = new URL(`${host}/transform/config/${transformId}/latest`)
        const response = await sendGETRequest(apiUrl)
        console.log('Received data:\r\n', response.data)
        expect(response.status).toBe(200)   
        expect(validateJSONSchema(configResponseSchema, response.data)).toBeTruthy()    
    })

    test('new transform job runs to completion', async({}) => {
        test.setTimeout(30 * 10 * 1000)
        const startTime = new Date().getTime()
        // Get latest version value for transform config  
        const transformId = "6ba94d94-3799-4233-9a2d-b2032e205422"
        let versionUrl = new URL(`${host}/transform/config/${transformId}/latest`)
        const versionResponse = await sendGETRequest(versionUrl)
        console.log('Received transform config data:\r\n', versionResponse.data)
        expect(versionResponse.status).toBe(200)   
        let latestVersion = await versionResponse.data.latest_version
        // Need to delete previous run from database first  
        const destinationDatasetId = 'bd39af3d-7d31-4f2c-bc48-6972877ac6ac'
        await deleteItem(destinationDatasetId)
        
        // Next submit transform job and check it's successful
        const createTransformBody = {
            "transform_id": transformId,
            "version": latestVersion
        }
        const apiUrl = new URL(`${host}/transform/create`)
        let response = await sendPOSTRequest(apiUrl, createTransformBody)
        console.log('Received new transform job data:/r/n', await response.data)
        expect(response.status).toBe(201)
        const instanceId = response.data.instance_id

        // Next check job status until it reaches 'complete'
        let jobStatus
        let statusResponse
        const statusRequestURL = new URL(`${host}/transform/status/${transformId}/${instanceId}`)
        while (jobStatus !== 'complete') {
            statusResponse = await sendGETRequest(statusRequestURL)
            expect(statusResponse.status).toBe(200)
            jobStatus = statusResponse.data.status
            if (jobStatus !== 'complete') sleep(10000)
            console.log(`Job status (${instanceId}) = `, statusResponse.data.status)
        }
        expect(jobStatus).toBe('complete')
        expect(statusResponse.data.transform_id).toBe(transformId) // job matches expected transform config id
        // check that job details returned are for a job created since the start of this test
        const createdAt = Date.parse(statusResponse.data.created_at)
        expect(createdAt).toBeGreaterThan(startTime)
        console.log('Job status data received:\r\n', statusResponse.data)
    })

})
