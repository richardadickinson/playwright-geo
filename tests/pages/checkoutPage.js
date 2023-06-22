import { expect } from '@playwright/test'
import { getCurrentDateTime } from '../helpers/helper'
import { getCollection } from '../fixtures/collections'

exports.CheckoutPage = class CheckoutPage {
    constructor(page) {
        this.page = page
        // Nav links
        this.collectionsLink = page.getByRole('button', { name: 'Collections' })
        this.catalogLink = page.getByRole('button', { name: 'Catalog' })
        this.myJobsLink = page.getByRole('button', { name: 'My Jobs' })
        // Job fields
        this.jobNumberField = page.getByPlaceholder('Job number')
        this.extractNameField = page.getByPlaceholder('Enter the extract name for this job')
        this.dataTab = page.getByRole('tab').filter({ hasText: 'Data' })        
        // Map fields
        this.canvas = page.locator('css=#viewDiv > div.esri-view-root > div.esri-view-surface > canvas')
        this.findAddressField = page.getByPlaceholder('Find address or place')
        this.areaSelectionDropdown = page.getByText('Area selection')
        this.drawRectangleLink = page.locator('button', { hasText: 'Draw a rectangle' })
        this.uploadShapefileButton = page.getByRole('button', { name: 'Upload shapefile (WGS-84)' })
        // Coordinate entry
        this.coordEntryButton = page.getByRole('button', { name: 'Coordinate entry' })
        this.topLeftLatField = page.getByRole('spinbutton').nth(0)
        this.bottomRightLatField = page.getByRole('spinbutton').nth(1)
        this.topLeftLongField = page.getByRole('spinbutton').nth(2)
        this.bottomRightLongField = page.getByRole('spinbutton').nth(3)
        this.coordEntryApplyButton = page.getByRole('button', { name: 'Apply' })
        this.coordEntryCancelButton = page.getByRole('button', { name: 'Cancel' })
        // checkout
        this.checkoutNowButton = page.getByRole('button', { name: 'Checkout now' })
   }

   async setupJob() {
     await this.jobNumberField.fill('077057-30')
     await expect(this.page.getByText('ESRI SOFTWARE RECHARGE')).toBeVisible()
     let friendlyName = 'autotest-'.concat(await getCurrentDateTime())
     friendlyName = friendlyName.replace(/[_\/:\s+]/g, '-')
     await this.extractNameField.fill(friendlyName)
     return friendlyName
   }

   async drawRectangle() {
     await this.findAddressField.fill('wolverhampton')
     await this.findAddressField.press('Enter')
     await expect (this.page.locator('h2', {hasText: 'Search Result'})).toBeVisible()
     await this.areaSelectionDropdown.click()
     await expect(this.drawRectangleLink).toBeVisible()
     await this.drawRectangleLink.click()
     await this.page.mouse.move(450, 500)
     await this.page.mouse.down()
     await this.page.mouse.move(750, 600)
     await this.page.mouse.up()
   }

   async enterCoordinates() {
      // how do we assert? - box is on esri map
      // for now create a job as you couldn't do that without an AOI
      let extractName = await this.setupJob()
      
      await this.areaSelectionDropdown.click()
      await this.coordEntryButton.click()
      await this.topLeftLatField.fill('-4.68')
      await this.bottomRightLatField.fill('-4.64')
      await this.topLeftLongField.fill('50.4160')
      await this.bottomRightLongField.fill('50.4000')
      await this.coordEntryApplyButton.click()

      return extractName
   }

   async uploadShapefile() {
      let extractName = await this.setupJob()
      
      await this.areaSelectionDropdown.click()
      // handle file selection
      const fileChooserPromise = this.page.waitForEvent('filechooser')
      await this.uploadShapefileButton.click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles('./tests/fixtures/polygon-chipping-norton.zip')

      await this.findAddressField.fill('chipping norton')
      await this.findAddressField.press('Enter')
      await this.page.waitForTimeout(3000) // give the map a couple of seconds to redraw for screenshot
      return extractName
   }

   async assertCollection({ test }, collectionName) {
     await this.dataTab.click()
     let collection = await getCollection(collectionName)
     let length = collection.length
     for (let i = 0; i < length; i++) {
          let escapedName = collection[i].replace(/\(/g, '\\(').replace(/\)/g, '\\)')
          const regex = new RegExp(`^${escapedName}\\s?\\(\\d+\\)$`)
          await test.info().annotations.push({ type: 'Checkout page', description: collectionName+' '+collection[i]})
          await expect(this.page.getByRole('heading', { name: regex })).toBeVisible()
          // remove the dataset
          let datasetText = await this.page.getByRole('heading', { name: regex }).textContent()
          await this.page.locator(`img:nth-child(1):right-of(:text-is("${datasetText}"))`).first().click()
          await expect(this.page.getByRole('heading', { name: regex })).toBeHidden()
     }
   }

}
    