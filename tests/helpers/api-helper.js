import { expect, request } from "@playwright/test";

let apiContext
const api_version = 'v1'
const tenantId = '32370034-2cdd-4fc3-b3f4-cfb22f73dad3'
const extract_host = 'https://api.geo.qa.adp.arup.com'
const apiBasePath = `/${api_version}/${tenantId}/extract/job`

// This solution is ok for waiting in code on an API response but may not be supported if waiting in browser execution.
const sleep = milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);

export async function getJobStatus(jobId, bearerToken) {
    
    apiContext = await request.newContext({
        baseURL: `${extract_host}`,
        extraHTTPHeaders: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
            'Connection': 'keep-alive'
        }
    })

    let jobStatus = null
    let count = 0

    while (jobStatus !== 'jobComplete' && count < 30) {
        const job = await apiContext.get(`${apiBasePath}/${jobId}/status`, {timeout:60000})
        
        if (job.status() === 403) expect (job.status()).toEqual(403)
        expect(job.ok()).toBeTruthy()
        jobStatus = JSON.parse((await job.body()).toString()).status
        console.log('job ID: '+ jobId + ' status: ' + jobStatus)
        
        if (jobStatus !== 'jobComplete') {
            sleep(10000)
            count++
        }
    }

    await apiContext.dispose()
}