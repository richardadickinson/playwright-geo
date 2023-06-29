const { test, expect } = require('@playwright/test')
const { GeoPortalHomePage } = require('../pages/homePage')
const { CollectionsPage } = require('../pages/collectionsPage')
const { CatalogPage } = require('../pages/catalogPage')
const { CheckoutPage } = require('../pages/checkoutPage')
const { MyJobsPage } = require('../pages/myJobsPage')

import { categories } from '../fixtures/collections'
import { screenshotOnFailure, getAppLoadTime, changePage } from '../helpers/helper'
import { getComparator } from 'playwright-core/lib/utils'

let collectedLoadTimes = []

test.describe('Test GUI', () => {

    test.afterAll(async ({})=> {
        // aggregate load times from all tests and check they are under arbitrary value = 3sec
        //let printedLoadTimes = JSON.stringify(collectedLoadTimes) //debug
        //test.info().annotations.push({type: 'Collected perf stats', description: printedLoadTimes}) //debug
        let pages = ['Collectionspage', 'Catalogpage', 'Checkoutpage', 'Myjobspage']

        pages.forEach(element => {
            const pageObjects = collectedLoadTimes.filter(obj => obj.name === element)
            if (pageObjects.length > 0) {
                const totalDuration = pageObjects.reduce((sum, obj) => sum + obj.duration, 0);
                const averageDuration = totalDuration / pageObjects.length;
                test.info().annotations.push({type: element+' average load duration', description: averageDuration.toFixed(2) + ' ms' })
                expect(averageDuration).toBeLessThan(5000)
            }
        });
    })

    test.afterEach(async ({})=> {
        collectedLoadTimes = collectedLoadTimes.concat(performance.getEntries())
    })

    test.afterEach(screenshotOnFailure)

    test.beforeEach(async ({page})=> {
        // setup homepage and login picking up existing auth for service user
        const homepage = new GeoPortalHomePage(page)
        await homepage.goto()
        await getAppLoadTime({ page, test }, 'Home page')
        await homepage.login() 
    })

    test('Signout of GADM app', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page) 
        await homepage.signout({ test })
        await getAppLoadTime({ page, test }, 'Sign out')
    })

    // collections
    test('Collections', async ({ page }) => {
        test.slow()
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')

        for (let i = 0; i < categories.length; i++) {
            const collectionsPage = new CollectionsPage(page)
            let index = i+1
            // assert collection(i) is displayed correctly on Collections page
            await collectionsPage.assertCollection({ test }, categories[i], index)
            // go to Checkout page
            await expect(page.locator('(//button[contains(text(),"Add to selection")])['+index+']')).toBeVisible()
            await changePage({ page, test }, page.locator('(//button[contains(text(),"Add to selection")])['+index+']'), '/en/catalog', 'Catalog page')
            const catalogPage = new CatalogPage(page)
            await catalogPage.collapseButton.click()
            await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')
            const checkoutPage = new CheckoutPage(page)
            // assert collection(i) is added to selection correctly
            await checkoutPage.assertCollection({ test }, categories[i])
            // return to collections page
            await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')
       }
    })

    test('Collections search filter', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')
        // set test values in search filter field and validate collections updates 
        const collectionsPage = new CollectionsPage(page)
        await collectionsPage.searchFilterField.fill('habitat')
        await collectionsPage.assertVisibleCollections('biodiversity')
        await collectionsPage.searchFilterField.fill('Infra')
        await collectionsPage.assertVisibleCollections('utilities')
        await collectionsPage.searchFilterField.fill('woodland')
        await collectionsPage.assertVisibleCollections('environment', 'background mapping')
        await collectionsPage.searchFilterField.clear()
        await collectionsPage.assertVisibleCollections('ALL')
    })

    // catalog
    test('Catalog dataset filter', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)

        await catalogPage.fillDatasetSearchFilter('Battle', '1 of 1')
        await catalogPage.clearDatasetSearchFilter()
        await catalogPage.fillDatasetSearchFilter('"flood zone"', '2 of 2')
        await catalogPage.clearDatasetSearchFilter()
    })

    test('Catalog - atlas links spot check', async ({ page }) => {
        test.slow()
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)

        await catalogPage.collapseButton.click()
        await catalogPage.openAtlasLinks()
    })

    test('Catalog - pagination: number of Datasets shown per page', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)
        await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
        
        // work around sorting issues by filtering list
        await catalogPage.searchOnDatasetsField.fill('boundary')

        await catalogPage.collapseButton.click()
        await catalogPage.countDatasetsInView(15)

        let numOnPage = [5,10,15,20,40,50]
        for (let i = 0; i < numOnPage.length; i++) {
            await catalogPage.clickNumberOnPage(numOnPage[i])
            await catalogPage.countDatasetsInView(numOnPage[i])
        }
    })

    test('Catalog - pagination: moving pages', async ({ page }) => {
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)
        await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
        // work around sorting issues by filtering list and displaying 10 per page
        await catalogPage.searchOnDatasetsField.fill('river')
        await catalogPage.collapseButton.click()
        await catalogPage.clickNumberOnPage(10)
        // validate pagination controls
        await expect(catalogPage.previousButton).toHaveClass(/disabled/)
        await expect(catalogPage.nextButton).not.toHaveClass(/disabled/)

        await expect(page.getByRole('list').filter({ hasText: '«Previous123»Next' })).toBeVisible()

        await catalogPage.nextButton.click()
        await expect(catalogPage.previousButton).not.toHaveClass(/disabled/)

        let pages = ['1', '2', '3']
        for (const p of pages) {
            let heading = await page.locator('.collection-row-content > div > h2:visible').first().textContent()
            await catalogPage.clickPageNumber(p)

            if (p === '1') {
                await expect(catalogPage.previousButton).toHaveClass(/disabled/)
                await expect(catalogPage.nextButton).not.toHaveClass(/disabled/)
            }
            if (p === '2') {
                await expect(catalogPage.previousButton).not.toHaveClass(/disabled/)
                await expect(catalogPage.nextButton).not.toHaveClass(/disabled/)
            }
            if (p === '3') {
                await expect(catalogPage.previousButton).not.toHaveClass(/disabled/)
                await expect(catalogPage.nextButton).toHaveClass(/disabled/)
            }

            expect(page.locator('.collection-row-content > div > h2:visible').first().textContent()).not.toEqual(heading)
        }    
    })

    const aoiType = ['shapefile', 'rectangle']
    for (const aoi of aoiType) {
        test(`Catalog - Reset filters - ${aoi}`, async ({ page }, testInfo) => {
            const homepage = new GeoPortalHomePage(page)
            await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
            const catalogPage = new CatalogPage(page)
            await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
            // sometimes React renders 2 versions of this field, using .first() as workaround
            await catalogPage.findAddressField.first().fill('chipping norton')
            await catalogPage.findAddressField.first().press('Enter') 
            await catalogPage.collapseButton.focus() // move focus to avoid mismatch on screenshot compare         
            await page.waitForTimeout(3000) // give the map a couple of seconds to redraw
            // cpature screenshot for comparison
            const beforeImage = await catalogPage.canvas.screenshot({path: 'test-results/screenshots/map.png'})
            //await testInfo.attach('Map - before load shapefile', {body: beforeImage, contentType: 'image/png'}) // debug

            // capture dataset text for comparison
            const compareText = await catalogPage.datasetsHeader.textContent()
            // upload shapefile & zoom map to shape
            if (aoi === 'shapefile') {
                await catalogPage.uploadShapefile()
                await page.waitForTimeout(3000) // give the map a couple of seconds to redraw for screenshot
            } else {
                await catalogPage.drawRectangle()
            }
            // screenshot - debug
            const withAoi = await catalogPage.canvas.screenshot({path: 'test-results/screenshots/map.png'})
            await testInfo.attach('Map - with AOI', {body: withAoi, contentType: 'image/png'})
            // filter datasets - boundary
            await catalogPage.searchOnDatasetsField.fill('boundary')
            await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
            //await catalogPage.latestOnlyCheckbox.uncheck()
            // expand datasets and select 2
            await catalogPage.collapseButton.click()
            await catalogPage.selectDatasets()
            // reset filters
            await catalogPage.collapseButton.click()
            await catalogPage.resetFiltersButton.click()
            await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()

            // validate: - selections retained - filter gone - shapefile gone - town retained - checkbox restored to default
            await expect(catalogPage.searchOnDatasetsField).toBeEmpty() // dataset filter cleared
            // screenshot
            const afterImage = await catalogPage.canvas.screenshot({path: 'test-results/screenshots/map2.png'})
            //await testInfo.attach('Map - after reset', {body: afterImage, contentType: 'image/png'}) // debug
            const comparator = getComparator('image/png') // - add { maxDiffPixels: 100 } to comparator if this next check turns out to be flaky
            expect(comparator(beforeImage, afterImage)).toBeNull()  // shapefile cleared
            const inputValue = await catalogPage.findAddressField.first().inputValue()
            expect(inputValue).toEqual('chipping norton')
            //await expect(catalogPage.latestOnlyCheckbox).toBeChecked() // Latest only restored to default
            await catalogPage.collapseButton.click()
            await expect(catalogPage.selectedTab).toContainText('Selected (2)') // selections retained
            expect(catalogPage.datasetsHeader).toHaveText(compareText) // all datasets included again
        })
    }

    test('Check AOI & selected datasets are retained on Checkout', async ({ page }, testInfo ) => {
        test.slow()
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.catalogLink, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)
        await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
        // sometimes React renders 2 versions of this field, using .first() as workaround
        await catalogPage.findAddressField.first().fill('chipping norton')
        await catalogPage.findAddressField.first().press('Enter') 
        //await catalogPage.collapseButton.focus() // move focus to avoid mismatch on screenshot compare         
        await page.waitForTimeout(3000) // give the map a couple of seconds to redraw
        await catalogPage.drawRectangle()
        // filter datasets - boundary
        await catalogPage.searchOnDatasetsField.fill('boundary')
        await expect(catalogPage.datasetHeaderLoadingSpinner).not.toBeVisible()
        // screenshot - debug
        const beforeImage = await catalogPage.canvas.screenshot({path: 'test-results/screenshots/beforeImage.png'})
        await testInfo.attach('Catalog - Map with AOI', {body: beforeImage, contentType: 'image/png'})
        // expand datasets and select 2
        await catalogPage.collapseButton.click()
        await expect(catalogPage.checkoutMessage).toBeVisible()
        await expect(catalogPage.checkoutButton).toBeDisabled()
        await catalogPage.selectDatasets()   
        // go to checkout page and validate
        await expect(catalogPage.checkoutMessage).not.toBeVisible()
        await expect(catalogPage.checkoutButton).toBeEnabled()
        await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')
        const checkoutPage = new CheckoutPage(page)
        // how to check AOI?  Maps are different on these pages - 3 fields are not present on checkout & height is 1 px out; screenshout compare won't work

        await expect(checkoutPage.dataTab).toContainText('Data (2)') // selections retained
        await checkoutPage.dataTab.click()
        await expect(page.getByRole('heading').filter({hasText: 'Boundary'})).toHaveCount(2)
    })

    // checkout
    test('Upload shapefile as AOI', async ({ page }, testInfo) => {
        test.slow()
        const homepage = new GeoPortalHomePage(page)
        await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')
        const collectionsPage = new CollectionsPage(page)

        await changePage({ page, test }, collectionsPage.landscapeSelector, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)
        await catalogPage.collapseButton.click()
        await expect(catalogPage.checkoutButton).toBeEnabled()
        await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')
        const checkoutPage = new CheckoutPage(page)
        let friendlyName = await checkoutPage.uploadShapefile()

        // screenshot for debug so we see if shapefile was loaded or not
        const mapscreen = await page.screenshot({path: 'test-results/screenshots/map-shapefile.png', fullPage: true})
        await testInfo.attach('Map with shapefile over Chipping Norton for AOI', {body: mapscreen, contentType: 'image/png'})

        // go to My jobs and view job
        await checkoutPage.checkoutNowButton.click()
        await page.waitForURL('/en/my-jobs', { timeout: 20000 })
        await page.waitForLoadState('domcontentloaded')
        const myJobsPage = new MyJobsPage(page)
        await expect(myJobsPage.getFirstTableRow).toBeVisible({ timeout: 20000 })
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('jobSubmitted', { timeout: 10000 })
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('077057-30')       
    })

    test('Set map coordinates', async({ page}) => {
        test.slow()
        const homepage = new GeoPortalHomePage(page)

        await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')
        const collectionsPage = new CollectionsPage(page)

        await changePage({ page, test }, collectionsPage.landscapeSelector, '/en/catalog', 'Catalog page')
        const catalogPage = new CatalogPage(page)
        await catalogPage.collapseButton.click()
        await expect(catalogPage.checkoutButton).toBeEnabled()
        await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')
        const checkoutPage = new CheckoutPage(page)
        let friendlyName = await checkoutPage.enterCoordinates() 

        // go to My jobs and view job
        await checkoutPage.checkoutNowButton.click()
        await page.waitForURL('/en/my-jobs', { timeout: 20000 })
        await page.waitForLoadState('domcontentloaded')
        const myJobsPage = new MyJobsPage(page)
        await expect(myJobsPage.getFirstTableRow).toBeVisible({ timeout: 20000 })
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('jobSubmitted')
        await expect(page.getByRole('row', { name: friendlyName })).toContainText('077057-30')
    })


    // analysis - download button can't be clicked because it doesn't exist until you scroll it into view.
    // Playwright's built in scrollIntoViewIfNeeded() therefore doesn't work as it is looking for an element that doesn't exist yet.
    // Accessibility issues with this table stop all other scroll methods working - no keyboard access, mouse only scrolls vertically.
    // Needs changes to the table element itself before this test can work.
    // test('Download button', async ({ page }) => {
    //     const homepage = new GeoPortalHomePage(page)

    //     await changePage({ page, test }, homepage.myJobsLink, '/en/my-jobs', 'My jobs page')
    //     const myJobsPage = new MyJobsPage(page)

    //     let friendlyName = 'fdfc8c7a-f146-4ccd-a244-9357de0f3fcd'
    //     let row = page.getByRole('row', { name: friendlyName })
    //     await expect(row).toContainText('Completed')
    //     //await expect(row.getByRole('button')).toHaveClass('download-link')
    //     //await page.getByText('Download').scrollIntoViewIfNeeded()  // can't work as element doesn't exist yet
    //     await row.locator('.download-link').focus()
    //     await row.locator('.download-link').click()
    //     await row.locator('//button/img[@src="/adp/icons/download.svg"]').click({force: true})
    //     // download the job output
    //     // Start waiting for download before clicking. Note no await.
    //     const downloadPromise = page.waitForEvent('download')
    //     await row.locator('//button/img[@src="/adp/icons/download.svg"]').click({force: true})
    //     //await myJobsPage.getLastCellInFirstRow.click()
    //     const download = await downloadPromise;
    //     // Wait for the download process to complete
    //     console.log(await download.path())
    //     // Save downloaded file somewhere
    //     let downloadName = friendlyName.concat('.zip')
    //     const downloadFile = await download.saveAs('/test-results/downloads/'.concat(downloadName))
    //     await testInfo.attach('Output extract file', {body: downloadFile, contentType: 'application/zip'})  	
    // })

})

