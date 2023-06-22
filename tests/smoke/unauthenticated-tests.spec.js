import { test, expect } from '@playwright/test'
import { GeoPortalHomePage } from '../pages/homePage'

test.describe('Test unauthenticated access to GUI', () => {

    test('Try to access pages when not authenticated', async ({ page }) => {

        let sitePages = ['collections', 'catalog', 'checkout', 'my-jobs']
        for (const sitePage of sitePages) {
            await page.goto('/en/'+sitePage)
            await expect(page.getByText('In order to access this section, you first need to be authenticated.')).toBeVisible()
            const testPage = new GeoPortalHomePage(page) 
            await expect(testPage.loginButton).toBeVisible()
            // page links
            await expect(testPage.collectionsLink).toBeHidden()
            await expect(testPage.catalogLink).toBeHidden()
            await expect(testPage.myJobsLink).toBeHidden()
            await expect(testPage.checkoutLink).toBeHidden()
        }
    })
})