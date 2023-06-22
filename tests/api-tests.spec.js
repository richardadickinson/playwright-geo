import { test, expect } from "@playwright/test";

const projectCode = '077057-30';
const api_version = '/v1';
const apiGuid = '/d15fea61-48b7-4779-aa6f-475a2d0a7163';
const token = 'adp_xEoXIbeTgPepsoboKHNHD8zzWyYCgh4feCND';
const extract_host = 'https://api.geo.qa.adp.arup.com';
const apiBasePath = `${api_version}${apiGuid}/extract/job`;

// Sync sleeping is tricky in js! This solution is ok for waiting in code on an API response but
// may not be supported if waiting in browser execution.
const sleep = milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);

test.describe('Test Extract API', () => {

    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: `${extract_host}`,
            extraHTTPHeaders: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`,
                'Connection': 'keep-alive'
            }
        })
    })

    test.afterAll(async ({}) => {
        await apiContext.dispose()
    })

    test('should create a new job', async ({ }) => {
        const newJob = await apiContext.post(`${apiBasePath}`, {
            data: requestBody
        });
        expect(newJob.ok()).toBeTruthy();
        const json = JSON.parse((await newJob.body()).toString());
        const jobId = json.jobId;

        const jobStatus = await apiContext.get(`${apiBasePath}/${jobId}/status`);
        expect(jobStatus.ok()).toBeTruthy();
        console.log(await jobStatus.json());
    }); 

    test('new job runs to completion', async ({ }) => {
        test.setTimeout(30 * 10000)
        const newJob = await apiContext.post(`${apiBasePath}`, {
            data: requestBody
        });
        expect(newJob.ok()).toBeTruthy();
        const json = JSON.parse((await newJob.body()).toString());
        const jobId = json.jobId;

        let jobStatus = null;

        // be very careful with loops in js - behaviour can be unexpected and can hammer CPU
        while (jobStatus !== 'jobComplete') {
            const job = await apiContext.get(`${apiBasePath}/${jobId}/status`);
            expect(job.ok()).toBeTruthy();
            jobStatus = JSON.parse((await job.body()).toString()).status;
            console.log('job ID: '+ jobId + ' status: ' + jobStatus);
            if (jobStatus !== 'jobComplete') sleep(10000);
        }

    }); 

});

const requestBody = {
    // request body
    "projectCode": `${projectCode}`,
    "consumerId": "Test Consumer",
    "jobMetadata": {
        "datasetId": "haduk_25km",
        "datasetVersion": "1.0",
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

const mockedPostResponse = {
        "jobId": "gibberish",
        "jobRequestDate": "2023-03-16T12:52:37.281",
        "jobStatus": "jobSubmitted",
        "projectName": "ADP-GADM"
    }

const mockedGetResponse = {
    "jobId": "gibberish",
    "status": "jobSubmitted",
    "result": {
        "submissionDate": "2023-03-16T12:52:41.920212+00:00",
        "completionDate": null,
        "downloadUrls": null
    },
    "messages": [
        "MOCKED: Not ready yet."
    ]
}