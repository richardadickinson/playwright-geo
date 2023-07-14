import { test, expect } from "@playwright/test"
import { extractAPIToken, extractHostname as host } from "../fixtures/envCreds"
import { tprdIngestHostname as ingestHost } from "../fixtures/envCreds"
import { sendGETRequest } from '../helpers/signedRequestHandler'

const projectCode = '077057-30'
const apiVersion = 'v2'
const tenantId = 'd15fea61-48b7-4779-aa6f-475a2d0a7163'
const apiBasePath = `/${apiVersion}/${tenantId}/extract/job`

const sleep = milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)

test.describe('Test Extract API', () => {

    let apiContext
    let vectorDatasetId = '395896b1-045f-4771-80f2-2b5c66bd15a0'
    let climateDatasetId = '82b24dc7-e7a0-4d02-8ce0-b43e7e0d8cfc'
    
    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: `${host}`,
            extraHTTPHeaders: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${extractAPIToken}`,
                'Connection': 'keep-alive'
            }
        })
    })

    test.afterAll(async ({ }) => {
        await apiContext.dispose()
    })

    const extractType = ['Climate', 'Vector']
    for (const eType of extractType) {
        test(`should create a new ${eType} job`, async ({ }) => {
            let newJob
            if (eType === 'Vector') {
                let version = await getVersion(vectorDatasetId)
                newJob = await apiContext.post(`${apiBasePath}`, {
                    data: await setVectorBody(version)
                })
            } else {
                let version = await getVersion(climateDatasetId)
                newJob = await apiContext.post(`${apiBasePath}`, {
                    data: await setClimateBody(version)
                })
            }
            console.log('New job data received:\r\n', await newJob.json())
            expect(newJob.ok()).toBeTruthy()
            const jobId = JSON.parse((await newJob.body()).toString()).jobId

            const response = await apiContext.get(`${apiBasePath}/${jobId}/status`)
            expect(response.ok()).toBeTruthy()
            const jobStatus = JSON.parse((await response.body()).toString()).status
            expect(jobStatus).toBe('jobSubmitted')
            console.log('Job status data received:\r\n', await response.json())
        })
    }

    test('new vector extract job runs to completion', async ({ }) => {
        test.setTimeout(30 * 10000)
        // submit job
        const newJob = await apiContext.post(`${apiBasePath}`, {
            data: await setVectorBody(await getVersion(vectorDatasetId))
        })
        console.log('Data received:\r\n', await newJob.json())
        expect(newJob.ok()).toBeTruthy()
        const jobId = JSON.parse((await newJob.body()).toString()).jobId

        let jobStatus = null
        // monitor job status
        while (jobStatus !== 'jobComplete') {
            const job = await apiContext.get(`${apiBasePath}/${jobId}/status`)
            expect(job.ok()).toBeTruthy()
            jobStatus = JSON.parse((await job.body()).toString()).status
            console.log('job ID: ' + jobId + ' status: ' + jobStatus)
            if (jobStatus !== 'jobComplete') sleep(10000)
        }
        expect(jobStatus).toBe('jobComplete')
    })
})

// Gets the latest dataset version value from Dataset API (requires AWS signed request)
async function getVersion(datasetId) {
    let apiUrl = new URL(`${ingestHost}/dataset/${datasetId}/latest`)
    const response = await sendGETRequest(apiUrl)
    expect(response.status).toBe(200)
    console.log('Received dataset details: ', response.data)
    return response.data.version
}

async function setVectorBody(version) {
    return {
        "projectCode": `${projectCode}`,
        "consumerId": "Test consumer",
        "jobMetadata": {
            "datasets": [
                {
                    "datasetId": "395896b1-045f-4771-80f2-2b5c66bd15a0",
                    "datasetVersion": `${version}`
                }
            ],
            "filter": {
                "filterType": "Vector",
                "areaOfInterest": {
                    "minx": "-1.878662109375",
                    "maxx": "1.6424560546875",
                    "miny": "50.583236614805884",
                    "maxy": "52.13011607781287",
                    "crs": "EPSG:4326"
                },
                "whereClause": ""
            },
            "dataExtract": {
                "format": "fgdb"
            }
        }
    }
}

async function setClimateBody(version) {
    return {
        "projectCode": `${projectCode}`,
        "consumerId": "Test Consumer",
        "jobMetadata": {
            "datasets": [
                {
                    "datasetId": "82b24dc7-e7a0-4d02-8ce0-b43e7e0d8cfc",
                    "datasetVersion": `${version}`
                }
            ],
            "filter": {
                "filterType": "Climate",
                "areaOfInterest": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "id": 11,
                            "type": "Feature",
                            "properties": {
                                "fid": "ABC123"
                            },
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                    [
                                        [
                                            -1.307373046875,
                                            51.49506473014368
                                        ],
                                        [
                                            -1.878662109375,
                                            51.17934297928927
                                        ],
                                        [
                                            -1.7962646484375,
                                            50.583236614805884
                                        ],
                                        [
                                            -1.0107421875,
                                            50.64249394010323
                                        ],
                                        [
                                            0.76904296875,
                                            50.792047064406866
                                        ],
                                        [
                                            1.42822265625,
                                            51.27909868682927
                                        ],
                                        [
                                            1.6424560546875,
                                            52.02207846999336
                                        ],
                                        [
                                            0.703125,
                                            52.13011607781287
                                        ],
                                        [
                                            -0.45593261718749994,
                                            52.07950600379697
                                        ],
                                        [
                                            -1.307373046875,
                                            51.49506473014368
                                        ]
                                    ]
                                ]
                            }
                        }
                    ]
                },
                "startDate": "1967-01-01",
                "endDate": "1968-01-01",
                "variables": [
                    {
                        "type": "variable",
                        "name": "tas"
                    },
                    {
                        "type": "param",
                        "name": "collection-all"
                    },
                    {
                        "type": "param",
                        "name": "frequency-mon"
                    },
                    {
                        "type": "param",
                        "name": "scenario-all"
                    }
                ],
                "whereClause": ""
            },
            "dataExtract": {
                "format": "nc"
            }
        }
    }
}

