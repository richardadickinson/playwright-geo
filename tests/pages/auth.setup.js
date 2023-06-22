import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/serviceUser.json';

setup('authenticate azure', async ({ page }) => {
    await page.goto('https://login.microsoftonline.com');
    await page.fill('input[type=email]', "SVC-ADP-Geo-CI-User@arup.onmicrosoft.com");
    await page.click('input[type=submit]');  
    await page.fill('input[type=password]', "/O#B-_j\\;wvV");
    await page.click('input[type=submit]');

    await page.context().storageState({ path: authFile });
});