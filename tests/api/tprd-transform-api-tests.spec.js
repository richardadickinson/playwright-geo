import { test, expect, chromium } from '@playwright/test'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import axios from 'axios'
import { configsSchema } from '../fixtures/transformConfigsSchema'
import Ajv from 'ajv'

let apiHostname = 'https://api.internal.gdam.dev.adp.arup.com'
let awsRegion = 'eu-west-1'
let awsAccessKeyId = 'ASIAYI5GFE7WNI6LS3UY'
let awsSecretAccessKey = 'zkbjy8cNFTq34RdJu/TCB3XDeJ6jIFvE19QPtu0l'
let awsSessionToken = 'IQoJb3JpZ2luX2VjECUaCWV1LXdlc3QtMSJIMEYCIQC/W5SvvjHWmdsziaOeNEmyA5tM39+VmvWV0SIis26vyAIhALw9iy9MsuMnFtCLr1YFY8YqsraJPcrZMKROJmKQxMqIKpsDCI7//////////wEQARoMNTY4ODk0NzYwOTQwIgwxe4SOZSgihdBPGt8q7wJjDC3CAJ5wk/RkZtVyvRZbgBUg90u9rTrzpFqWaGhYJmyG9WTpZmql92HCq1pJX7w4Uc0E2GO9Xl+QI3/e4/O1QnuFIVXsTwbQAXA0AJmOsr6VCIbOVTSoJPZjsEmrFo7teVGL5t8oYigtpLq6gMS1fgPhYpmB+LZnWVdIXnd4xO8NAoSrNaQc1dfGPf0zyG67szhk7Y2tamvHOx3PZz9N87kwMKzgj36qhAbRtFLWGdS9RW1owAEQVZHjKu8SwMCVPGLRqWcJ8oHa7w0Hqc6vJcpuadPxT0/hrxs4af5sePIpgyMu6izCrboGrzLBCnLFCnC/3kyY1f8mBwF31s4X4cPjdZKbiH80zkhW3ldJT5Yk0TQSNumKZzTi9NBS/VN6gcuosmFhajlHGF2cTKgCHRjjHEL22ZdqWfHkvT2Ft/ssLLUOwErRjjzmwogQYAhhaL6UWpTCn6b84N+RSNW9xjmKeMdv2ij3AT8vtRMuMNiD9qQGOqUBrhxWwOZLYUyODwxFWOz59ZueQWN1cog0IQvRyocM48XDGKU6JVN4utjwirbv6Dmj0pCc08c4mJiaJ70oyo102E2uA596oLm9qjTqr44JcW9yMb55iPHK/xjtAEYkV/+K5qA4eUOSthSsTfaeO83hUCL9FAUTZ3q5WzgyOQE0/Z7FcYfY0hHGmvpaqfNvoG4hcVan5p9SRB+gqGBSv9rJ5yvIF7aO'

test.describe('Test TPRD Transform API', () => {

    let signatureTemplate

    test.beforeAll(async ({}) => {

        signatureTemplate = new SignatureV4({
            service: 'execute-api',
            region: awsRegion,
            credentials: {
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
                sessionToken: awsSessionToken
            },
            sha256: Sha256
        })
    })

    test('should get TPRD API version (axios)', async ({}) => {
        let apiUrl = new URL(`${apiHostname}/version/transform`)
        let signature = await signRequest(apiUrl)
        const response = await axios({
            ...signature,
            url: apiUrl, // compulsory
        })
        expect(response.status).toBe(200)
        console.log('Successfully received data: ', response.data)
    })

    test('should get TPRD transform configs', async({}) => {

        let apiUrl = new URL(`${apiHostname}/transform/configs`)

        let signature = await signRequest(apiUrl)

        const response = await axios({
            ...signature,
            url: apiUrl, // compulsory
        })
        expect(response.status).toBe(200)
        console.log('Successfully received data:\r\n', response.data)

        //validate JSON schema of response
        const ajv = new Ajv()
        const validate = ajv.compile(configsSchema)
        const isJsonValid = validate(response.data)
        expect(isJsonValid).toBeTruthy()
        if (!isJsonValid) {
            console.log(validate.errors)
        }
    })

    async function signRequest(apiUrl) {
        let signature = await signatureTemplate.sign({
            method: 'GET',
            hostname: apiUrl.host,
            path: apiUrl.pathname,
            protocol: apiUrl.protocol,
            headers: {
              'Content-Type': 'application/json',
              host: apiUrl.hostname
            }
        })

        return signature
    }

});