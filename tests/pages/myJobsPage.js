import { expect } from '@playwright/test';

exports.MyJobsPage = class MyJobsPage {

    constructor(page) {
        this.page = page
        this.searchField = page.getByPlaceholder('Search by project name')
        this.getFirstTableRow = page.locator('tr').nth(1)
        this.getFirstCellInFirstRow = page.locator('tr:nth-child(1) > td:nth-child(1)')
        this.getLastCellInFirstRow = page.locator('tr:nth-child(1) > td:nth-child(8) > button.download-link')
    }
}
