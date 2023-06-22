import { expect } from '@playwright/test'

exports.GeoPortalHomePage = class GeoPortalHomePage {
    
    constructor(page) {
        this.page = page
        this.loginButton = page.getByRole('button', { name: 'Login to app'})
        this.usernameField = page.locator('#navbarDropdown')
        this.collectionsLink = page.getByRole('button', { name: 'Collections' })
        this.catalogLink = page.getByRole('button', { name: 'Catalog' })
        this.myJobsLink = page.getByRole('button', { name: 'My Jobs' })
        this.checkoutLink = page.getByRole('button', { name: 'Checkout' })
        this.signoutButton = page.getByRole('button', { name: 'Signout'})
        this.authWelcomeMessage = page.getByRole('heading', { name: 'Welcome to Geospatial'})
        this.unauthWelcomeMessage = page.getByRole('heading', { name: 'Welcome guest user!' })
    }

    async goto() {
        await this.page.goto('/')
    }

    async login() {
        if (await this.loginButton.isVisible()) {
            await this.loginButton.click()
        }
        await expect(this.authWelcomeMessage).toBeVisible()
        await expect(this.unauthWelcomeMessage).toBeHidden()
        await expect(this.usernameField).toBeVisible()
        await expect(this.usernameField).toHaveText('SVC-ADP-Geo-CI-User@arup.onmicrosoft.com')

        // page links
        await expect(this.collectionsLink).toBeVisible()
        await expect(this.catalogLink).toBeVisible()
        await expect(this.myJobsLink).toBeVisible()
        await expect(this.checkoutLink).toBeVisible()
    }

    async signout() {
        await this.usernameField.click()
        await this.signoutButton.click()
        await this.page.locator('div > small', { hasText: 'SVC-ADP-Geo-CI-User@arup.onmicrosoft.com' }).click() // microsoft popup
        await expect(this.unauthWelcomeMessage).toBeVisible()
        await expect(this.loginButton).toBeVisible()
        await expect(this.authWelcomeMessage).toBeHidden()
        await expect(this.usernameField).toBeHidden()
        // page links
        await expect(this.collectionsLink).toBeHidden()
        await expect(this.catalogLink).toBeHidden()
        await expect(this.myJobsLink).toBeHidden()
        await expect(this.checkoutLink).toBeHidden()
    }
}