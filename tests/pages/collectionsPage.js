import { expect } from '@playwright/test'
import { categories, getCollection } from '../fixtures/collections'

exports.CollectionsPage = class CollectionsPage {
    
    constructor(page) {
        this.page = page
        this.searchFilterField = page.getByPlaceholder('Search on the collection')
        this.landscapeSelector = page.locator('(//button[contains(text(),"Add to selection")])[1]')
        this.transportSelector = page.locator('(//button[contains(text(),"Add to selection")])[2]')
   }

    async goto() {
        await this.page.goto('https://geo.qa.adp.arup.com/en/collections');
    }

    async assertCollection({ test }, collectionName, index) {
        let collection = await getCollection(collectionName)
        let length = collection.length
        
        if (collectionName === 'landscape') {
            await expect(this.page.locator('.btn').first()).toBeVisible({timeout:10000})
            await this.page.locator('.btn').first().click()
        } else {
            await expect(this.page.locator('(//button[contains(text(),"View more")])['+index+']')).toBeVisible()
            await this.page.locator('(//button[contains(text(),"View more")])['+index+']').click()
        }

        for (let i = 0; i < length; i++) {
            await test.info().annotations.push({ type: 'Collections page', description: collectionName+' '+collection[i]})
            await expect(this.page.getByRole('button', { name: collection[i], exact: true })).toBeVisible()     
        }   
        await this.page.getByRole('button', { name: 'View less' }).click()
        await expect(this.page.getByRole('button', { name: collection[0], exact: true })).toBeHidden()    
    }

    // pass the names of collections (up to 2) that you expect to be visible on page
    // if all collections should be visible, pass 'ALL'
    async assertVisibleCollections(collectionName, collectionName2) {
        if (collectionName === undefined) collectionName = ''
        if (collectionName2 === undefined) collectionName2 = ''
        let collections = categories
        for (let i = 0; i < collections.length; i++) {
            if (collections[i] === collectionName || collections[i] === collectionName2
                || collectionName === 'ALL') {
                await expect(this.page.getByRole('heading', {name: collections[i]})).toBeVisible()
            } else {
                await expect(this.page.getByRole('heading', {name: collections[i]})).toBeHidden()
            }
        }
    }

}