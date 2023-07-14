import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import axios from 'axios'
import { awsCreds } from '../fixtures/envCreds'

let signatureTemplate = new SignatureV4({
    service: 'execute-api',
    region: 'eu-west-1',
    credentials: awsCreds,
    sha256: Sha256
})

export async function sendGETRequest(apiUrl) {
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
    const response = await axios({
        ...signature,
        url: apiUrl
    })
    .catch((error) => {
        console.log(error)
        throw error
    })
    return response
}

export async function sendPOSTRequest(apiUrl, body) {
    let bodyString = JSON.stringify(body)
    let cLength = String(Buffer.byteLength(bodyString))

    let signature = await signatureTemplate.sign({
        method: 'POST',
        hostname: apiUrl.host,
        path: apiUrl.pathname,
        protocol: apiUrl.protocol,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': cLength,
            host: apiUrl.hostname
        },
        body: bodyString
    })
    const response = await axios({
        ...signature,
        url: apiUrl,
        data: body
    })
    .catch((error) => {
        console.log(error)
        throw error
    })
    return response
}
