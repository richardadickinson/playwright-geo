import Ajv from 'ajv'
import addFormats from "ajv-formats"
import { expect } from '@playwright/test'

export async function validateJSONSchema(schema, responseData) {
    const ajv = new Ajv()
    addFormats(ajv)
    const validate = ajv.compile(schema)
    const isJsonValid = validate(responseData)
    expect(isJsonValid).toBeTruthy()
    if (!isJsonValid) {
        console.log(validate.errors)
        return false
    } 
    return true 
}