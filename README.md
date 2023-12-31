# adp-playwright-api-poc
# Playwright automated tests info

## Setup
# Install necessary packages
```npm init playwright@latest
npm install @axe-core/playwright
```
Axe is for accessibility scanning

# Run tests from Terminal
All tests - `npx playwright test`
Filtered and visible - `npx playwright test -g "smoke" --headed`
Filtered by project & test: `npx playwright test --project "api tests" -g "tprd"`
See test report - `npx playwright show-report`

## Summary of automated GUI tests and their purpose

# Smoke tests
The following tests are all run whenever a PR is merged to main ensuring breaking changes can't be checked in.

All tests 
* run using a service user account: SVC-ADP-Geo-CI-User@arup.onmicrosoft.com
* authentication is performed once and shared by all subsequent tests
* login status is verified before each test is run
* page load times are collected, averaged per worker thread, and asserted against if <10 secs (except loading My jobs when creating a new job, which takes longer) or <5 secs when averaged

1. Signout
Checks signout works and verifies buttons/links to other functionality are hidden

2. Collections
Verified all Collections are present, contain the expected datasets, can be selected to Checkout and can be deleted from selection

3. Collections search filter
Verifies collection search filter works as expected

4. Catalog dataset search filter
Verifies dataset search filter works as expected

5. Catalog metadata modal
Opens the modal, expands a node and verifies other nodes present for 2 datasets

6. Catalog Atlas linking
Spot checks a couple of datasets correctly link through to the expected Atlas page for the dataset

7. Catalog pagination
Two tests exercise the Catalog pagination controls - datasets shown per page, cycling through pages, Next/Previous button behaviour

8. Catalog Reset filters
Validates the behaviour of the Reset Filters button on the Catalog.
Checks AOI & text filters are cleared but map location & selected datasets are retained
Test is run once for selecting AOI via shapefile and once via draw a rectangle

9. Selection retention on Checkout
Verifies that the expected selected datasets are retained on the Checkout page

10. Upload shapefile
Verifies a shapefile can be uploaded and an extract job submitted for it

11. Set map coordinates
Verified that AOI can be added by entering map coords and an extract job submitted for it

12. Unauthenticated tests
Visits all pages when not authenticated and verifies message shown to user and that no data is shown or buttons/links (other than Login) are available.

## Accessibility
A single test that visits all the pages of the GUI and runs an a11y scan on each.
The reports are attached to the test report and bugs have been raised for the findings.
When all issues are resolved (or ignored) we can enable an assert in this test to catch any new infractions added in future.

## End-to-End tests
A GUI test exists that creates a new extract job and monitors it through to completion.
Currently this test isn't included in any pipelines and some a11y changes are required to the My jobs table before we can test download of the extract.

## Exclusions
No attempt has been made to test the ARC accessibility functionality as this comes from the shared Arup library and is the responsibility of another team.

Downloading extract output cannot currently be tested due to issues with the My jobs table which need resolving.


### API Tests

## Setup
# Install necessary packages
```npm init playwright@latest
npm install aws-sdk @aws-sdk/signature-v4 @aws-crypto/sha256-js @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb
npm install ajv ajv-formats axios
```
Axios is an HttpClient
Ajv is a JSON schema validator library
The AWS libs are for preparing the AWS signature for IAM & interacting with Dynamo DB

1. Extract API
Tests to create new extract jobs for climate and vector
Test to submit an extract job and monitor it to completion.

2. TPRD Transform Ingest API
Tests to retrieve API version and job configs
Test to send transform job and monitor to completion