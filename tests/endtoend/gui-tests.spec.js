const { test, expect } = require('@playwright/test')
const { GeoPortalHomePage } = require('../pages/homePage')
const { CollectionsPage } = require('../pages/collectionsPage')
const { CatalogPage } = require('../pages/catalogPage')
const { CheckoutPage } = require('../pages/checkoutPage')

import { screenshotOnFailure, getAppLoadTime, changePage } from '../helpers/helper'

test.describe('Test GUI', () => {

    test.afterEach(screenshotOnFailure);

    test.beforeEach(async ({ page })=> {
        // setup homepage and login picking up existing auth for service user
        const homepage = new GeoPortalHomePage(page)   
        await homepage.goto()
        await getAppLoadTime({ page, test }, 'Home page')
        await homepage.login()      
    })

    test('Signout test', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page) 
        await homepage.signout()
        await getAppLoadTime({ page, test }, 'Sign out')
    })

    test('Run a Landscape extract job', async ({ page }, testInfo )=> {
        test.setTimeout(6 * 60 * 1000)

        const homepage = new GeoPortalHomePage(page) 
        await changePage({page,test}, homepage.collectionsLink, '/en/collections', 'Collections page')

        // collections page - select landscape
        await page.waitForURL('/en/collections')
        const collectionsPage = new CollectionsPage(page)
        expect(collectionsPage.landscapeSelector).toBeVisible({timeout: 10000})
        await changePage({page, test}, collectionsPage.landscapeSelector, '/en/catalog', 'Catalog page')

        //catalog page
        const catalogPage = new CatalogPage(page)
        await catalogPage.collapseButton.click()
        await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')        
        
        // checkout page - draw a rectangle on map
        await page.waitForURL('/en/checkout')
        const checkoutPage = new CheckoutPage(page)
        // create job
        let friendlyName = await checkoutPage.setupJob()
        test.info().annotations.push({ type: 'Extract name', description: friendlyName })
        await checkoutPage.drawRectangle()

        // screenshot
        const mapscreen = await page.screenshot({path: 'test-results/screenshots/map-rect.png', fullPage: true})
        await testInfo.attach('Map with AOI', {body: mapscreen, contentType: 'image/png'})

        await checkoutPage.checkoutNowButton.click()

        // go to My jobs and view job
        await page.waitForURL('/en/my-jobs', { timeout: 20000 })

        await expect(page.getByRole('row', { name: friendlyName })).toContainText('jobSubmitted')
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('077057-30')

        // wait until job completes - API version
        // const jobId = await myJobsPage.getFirstCellInFirstRow.textContent();
        // const authResult = await page.evaluate(()=> {
        //     return localStorage.getItem('auth_result')
        // })
        // const parsedAuthResult = JSON.parse(authResult)
        // const bearerToken = parsedAuthResult["idToken"]

        // test.info().annotations.push({ type: 'jobId', description: jobId })
        // test.info().annotations.push({ type: 'bearerToken', description: bearerToken })
        // await getJobStatus(jobId, bearerToken)

        // wait until job completes - GUI version
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('Completed', {timeout: 6 * 60 * 1000})

        // screenshot
        //const myjobsscreen = await page.locator('table').screenshot({path: 'test-results/screenshots/myJobsTable.png', fullPage: true})
        //await testInfo.attach('My Jobs Table', {body: myjobsscreen, contentType: 'image/png'})

        //await page.reload()
        
        await expect(page.getByRole('row', { name: friendlyName }).getByRole('button')).toHaveClass('download-link')
        let row = page.getByRole('row', { name: friendlyName })
        // download the job output
        // Start waiting for download before clicking. Note no await.
        const downloadPromise = page.waitForEvent('download')
        await row.getByRole('button').click({force: true})
        //await myJobsPage.getLastCellInFirstRow.click()
        const download = await downloadPromise;
        // Wait for the download process to complete
        console.log(await download.path())
        // Save downloaded file somewhere
        let downloadName = friendlyName.concat('.zip')
        const downloadFile = await download.saveAs('/test-results/downloads/'.concat(downloadName))
        await testInfo.attach('Output extract file', {body: downloadFile, contentType: 'application/zip'})
    })

})