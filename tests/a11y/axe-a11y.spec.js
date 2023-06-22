import { test, expect } from '@playwright/test'
import { GeoPortalHomePage } from '../pages/homePage'
import { CollectionsPage } from '../pages/collectionsPage'
import { CheckoutPage } from  '../pages/checkoutPage'
import { CatalogPage } from '../pages/catalogPage'
import { MyJobsPage } from '../pages/myJobsPage'

import { a11yScanResults, screenshotOnFailure, getAppLoadTime, changePage } from '../helpers/helper'

test.afterEach(screenshotOnFailure);

test.describe('Test Accessibility', () => {

    test('Check accessibility', async ({ page }, testInfo)=> {
        test.slow()
        const homepage = new GeoPortalHomePage(page)

        // home page
        await homepage.goto()
        await getAppLoadTime({ page, test }, 'Home page')
        await homepage.login()

        await a11yScanResults(homepage, testInfo, 'Home page')
        await changePage({ page, test }, homepage.collectionsLink, '/en/collections', 'Collections page')

        // collections page - select landscape
        const collectionsPage = new CollectionsPage(page)        
        expect(collectionsPage.landscapeSelector).toBeVisible({timeout: 10000})
        await a11yScanResults(collectionsPage, testInfo, 'Collections page')
        await changePage({ page, test }, collectionsPage.landscapeSelector, '/en/catalog', 'Catalog page')

        // catalog page
        const catalogPage = new CatalogPage(page)
        await catalogPage.collapseButton.click()
        await a11yScanResults(catalogPage, testInfo, 'Catalog page')
        await changePage({ page, test }, catalogPage.checkoutButton, '/en/checkout', 'Checkout page')

        // checkout page
        const checkoutPage = new CheckoutPage(page)
        await a11yScanResults(checkoutPage, testInfo, 'Checkout page')
        await changePage({ page, test }, checkoutPage.myJobsLink, '/en/my-jobs', 'My jobs page')

        // go to My jobs and view job
        const myJobsPage = new MyJobsPage(page)
        await a11yScanResults(myJobsPage, testInfo, 'My Jobs page')
    })

})