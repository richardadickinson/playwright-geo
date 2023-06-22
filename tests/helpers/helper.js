import AxeBuilder from '@axe-core/playwright'
import { expect } from '@playwright/test'

export async function screenshotOnFailure({ page }, testInfo) {
    if (testInfo.status !== testInfo.expectedStatus) {
        // Get a unique place for the screenshot
        const screenshotPath = testInfo.outputPath(`failure.png`);
        // Add it to the report
        testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' });
        // Take the screenshot itself
        await page.screenshot({ path: screenshotPath, timeout: 5000 });
    }
}

export async function a11yScanResults({ page }, testInfo, pageName) {
    const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) // restricts scan to WCAG2A/2AA/21A/21AA
    .analyze()
    // Use .exclude() to exempt elements with known issues (like map)
    //.exclude('#element-with-known-issue')
    // To disable individual scan rules use .disableRules(['rule-name'])
    //.disableRules(['duplicate-id'])

    //Attach the violations to the test report
    await testInfo.attach(pageName+" accessibility scan results", {
        body: JSON.stringify(scan.violations, null, 2),
        contentType: "application/json",
    });

    //expect(scan.violations).toEqual([])
}
  
export async function getCurrentDateTime() {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString({hour12: false})
    let datetime = date.concat("_", time)
    return datetime
}

// its a React app so it only loads once - not on every page navigation
export async function getAppLoadTime({ page, test }, pageName) {
    const duration = await page.evaluate(() => window.performance.getEntriesByType('navigation')[0].duration)
    test.info().annotations.push({type: pageName + ' load duration', description: duration.toFixed(2) + ' ms'})
}

// don't use in conjunction with clicking 'Checkout now' button as creating a new job takes longer than loading pages
export async function changePage({ page, test }, clickElement, url, pageName) {
    // change page
    performance.mark('beginAction')
    await clickElement.click()
    await page.waitForURL(url)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')
    performance.mark('endAction')

    // output duration of page load action
    let actionName = pageName.replace(/\s+/g, '');
    performance.measure(actionName, 'beginAction', 'endAction')
    const measures = JSON.stringify(performance.getEntriesByName(actionName))
    const parsedMeasures = JSON.parse(measures)
    //test.info().annotations.push({type: 'measures', description: measures })
    const durations = parsedMeasures.map(entry => entry.duration)
    let i = parsedMeasures.length - 1
    const actionTime = durations[i].toFixed(2)
    test.info().annotations.push({type: pageName + ' load duration', description: actionTime + ' ms' })

    expect(parseFloat(actionTime)).toBeLessThan(10000)

    // use the following to empty the performance cache
    //clearMeasures()
    //clearMeasures(name)
}
