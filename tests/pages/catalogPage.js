import { expect } from '@playwright/test'
import { atlasLinks } from '../fixtures/collections'

exports.CatalogPage = class CatalogPage {
    constructor(page) {
        this.page = page
        // nav
        this.myJobsLink = page.getByRole('button', { name: 'My Jobs' })
        this.checkoutLink = page.locator('arc-navbar').getByRole('button', { name: 'Checkout' })
        // map
        this.canvas = page.locator('css=#viewDiv > div.esri-view-root > div.esri-view-surface > canvas')
        this.findAddressField = page.getByPlaceholder('Find address or place')
        this.areaSelectionDropdown = page.getByText('Area selection')
        this.drawRectangleLink = page.getByText('Draw a rectangle')
        this.uploadShapefileButton = page.getByRole('button', { name: 'Upload shapefile (WGS-84)' })
        this.searchOnDatasetsField = page.getByRole('textbox', { name: 'Search on the datasets'})
        this.latestOnlyCheckbox = page.getByLabel('Latest only')
        this.resetFiltersButton = page.getByRole('button', { name: 'Reset filters' })
        // datasets
        this.datasetHeaderLoadingSpinner = page.getByRole('row', { name: 'tail-spin-loading' }).getByTestId('tail-spin-loading')
        this.selectedTab = page.getByRole('tab').filter({ hasText: 'Selected' })
        this.datasetsHeader = page.locator('.integrated-drawer-header')
        this.collapseButton = page.locator('.collapse-button')
        this.checkoutMessage = page.locator('.one-dataset-required-message')
        this.checkoutButton = page.locator('.catalog-footer-actions').getByRole('button', { name: 'Checkout' })
        // dataset pagination
        this.previousButton = page.getByRole('listitem').filter({ hasText: 'Previous' })
        this.nextButton = page.getByRole('listitem').filter({ hasText: 'Next' })
        
    }

    async fillDatasetSearchFilter(filter, expectedText) {
        await expect(this.datasetsHeader).toContainText('Datasets (15 of')
        await this.searchOnDatasetsField.fill(filter)
        await expect(this.datasetsHeader).toContainText('Datasets ('+expectedText+')')
    }
    async clearDatasetSearchFilter() {
        await this.resetFiltersButton.click()
        await expect(this.datasetsHeader).toContainText('Datasets (15 of')
    }

    async uploadShapefile() {
        await this.areaSelectionDropdown.click()
        // handle file selection
        const fileChooserPromise = this.page.waitForEvent('filechooser')
        await this.uploadShapefileButton.click()
        const fileChooser = await fileChooserPromise
        await fileChooser.setFiles('./tests/fixtures/polygon-chipping-norton.zip')
    }

    async drawRectangle() {
        await expect (this.page.locator('h2', {hasText: 'Search Result'})).toBeVisible()
        await this.areaSelectionDropdown.click()
        await expect(this.drawRectangleLink).toBeVisible()
        await this.drawRectangleLink.click()
        await this.page.mouse.move(450, 500)
        await this.page.mouse.down()
        await this.page.mouse.move(750, 600)
        await this.page.mouse.up()
    }

    async openAtlasLinks() {
        await this.page.getByTitle('Select').first().isVisible()

        // work around sorting issues by filtering list
        await this.searchOnDatasetsField.fill('boundary')

        for (var i=0; i < atlasLinks.length; i++) {
            const pagePromise = this.page.waitForEvent('popup')
            await this.page.locator('button:nth-child(2):right-of(:text("'+atlasLinks[i][0]+'"))').first().click()
            const linkPage = await pagePromise
            await linkPage.waitForLoadState()
            await expect(linkPage.locator('#pagetitle')).toHaveText(atlasLinks[i][1])
            await linkPage.close()
        }
    }

    async countDatasetsInView(value) {
        await this.page.getByTitle('Select').first().isVisible()
        await expect(this.page.getByTitle('Select')).toHaveCount(value)
    }

    async clickNumberOnPage(value) {
        await this.page.getByRole('list').filter({ hasText: '51015204050' }).getByRole('link', { name: value, exact: true }).click()
        await expect(this.datasetHeaderLoadingSpinner).not.toBeVisible()
    }

    async clickPageNumber(value) {
        await this.page.getByRole('list').filter({ hasText: '«Previous123»Next' }).getByRole('link', { name: value, exact: true }).click()
        await expect(this.datasetHeaderLoadingSpinner).not.toBeVisible()
    }

    async selectDatasets() {
        await this.page.getByTitle('Select').first().isVisible()
        // no datasets selected
        await expect(this.selectedTab).toContainText('Selected (0)') 
        await expect(this.page.locator('//img[@src="/adp/icons/tick.svg"]')).toHaveCount(0)

        for (var i=0; i < atlasLinks.length; i++) {
            await this.page.locator('button:nth-child(1):right-of(:text("'+atlasLinks[i][0]+'"))').first().click()
            const img = await this.page.locator('img:nth-child(1):right-of(:text("'+atlasLinks[i][0]+'"):visible)').first()
            await expect(img).toHaveAttribute('src', '/adp/icons/tick.svg')     
        }  
        
        // check 2 datasets are selected
        await expect(this.selectedTab).toContainText('Selected (2)')
        await expect(this.page.locator('//img[@src="/adp/icons/tick.svg"]')).toHaveCount(2)
    }
}