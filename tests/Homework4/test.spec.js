import {faker} from '@faker-js/faker';
import {expect, request} from "@playwright/test";
import {AdminPage} from "./pages/admin.page";
import {CommonPage} from "./pages/common.page";
import {TimesheetsPage} from "./pages/timesheets.page";

const {test} = require("@playwright/test");
const {LoginPage} = require("./pages/login.page");
const {PimPage} = require("./pages/pim.page");

let page;
let context;
let token;
let apiContext;
test.beforeAll(async ({browser}) => {
    context = await browser.newContext({viewport: {height: 900, width: 1600}});
    page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.validLoginOrangeHr('Admin', 'admin123');
    context = await loginPage.saveSession(context);
    token = await loginPage.getToken(context);
    apiContext = await request.newContext();
});

test('Verify that a new employee can be added with all mandatory fields filled', async () => {
    const pimPage = new PimPage(page, apiContext, token);
    const employeesList = await pimPage.getEmployeesWithApi();
    const allEmployeesIds = [];
    employeesList.map(e => {
        allEmployeesIds.push(e.employeeId);
    });

    let employeeId = faker.number.int(9999);
    while (allEmployeesIds.some(e => e === (String(employeeId)))) {
        employeeId = faker.number.int(9999);
    }

    await test.step('Open employee list page and click add new employee button', async () => {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
        await pimPage.employeeList.addButton.click();
    });

    let response;
    const employeeData = {
        employeeId: String(employeeId),
        firstName: faker.person.firstName(),
        middleName: faker.person.middleName(),
        lastName: faker.person.lastName(),
    };
    await test.step('Create new employee', async () => {
        await pimPage.fillEmployeeData(employeeData);
        response = await pimPage.clickSaveEmployeeAndGetResponse();
    });

    await test.step('Check if employee is added', async () => {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
        await pimPage.fillEmployeeNameFilter(employeeData.firstName + ' ' + employeeData.middleName + ' ' + employeeData.lastName);
        await pimPage.clickEmployeeSearchButton();
        await expect(pimPage.employeeList.table.id).toHaveCount(1);
        await expect(pimPage.employeeList.table.id).toHaveText(response.data.employeeId);
        await expect(pimPage.employeeList.table.firstName).toHaveText(response.data.firstName + ' ' + response.data.middleName);
        await expect(pimPage.employeeList.table.lastName).toHaveText(response.data.lastName);
    });

    await test.step('Delete employee', async () => {
        await pimPage.deleteEmployeeByIdWithApi([response.data.empNumber]);
    });
});

test('Verify just deleted user can not access the system', async ({browser}) => {
    const pimPage = new PimPage(page, apiContext, token);
    const adminPage = new AdminPage(page, apiContext, token);
    let newUserData;
    let employeesList;
    let userData;

    await test.step('Create new user', async () => {
        employeesList = await pimPage.getEmployeesWithApi();
        userData = {
            username: faker.internet.username(),
            password: faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'}),
            status: true,
            userRoleId: 1,
            empNumber: employeesList[0].empNumber,
        }
        newUserData = await adminPage.addUserWithApi(userData);
    });

    const newContext = await browser.newContext({viewport: {height: 900, width: 1600}});
    const newPage = await newContext.newPage();
    const secondWindowLoginPage = new LoginPage(newPage);

    await test.step('Check if user can login', async () => {
        await secondWindowLoginPage.validLoginOrangeHr(userData.username, userData.password);
        const secondCommonPage = new CommonPage(newPage);
        await secondCommonPage.logOut();
    });

    await test.step('Delete user', async () => {
        await adminPage.deleteUserWithApi([newUserData.id]);
    });

    await test.step('Check if user delete user can not login', async () => {
        await secondWindowLoginPage.invalidLoginOrangeHr(userData.username, userData.password);
    });
});

test('Verify that employee details can be edited and saved successfully', async () => {
    const pimPage = new PimPage(page, apiContext, token);
    let response;
    let employeeData;

    await test.step('Add new employee with API', async () => {

        const employeesList = await pimPage.getEmployeesWithApi();
        const allEmployeesIds = [];
        employeesList.map(e => {
            allEmployeesIds.push(e.employeeId);
        });

        let employeeId = faker.number.int(9999);
        while (allEmployeesIds.some(e => e === (String(employeeId)))) {
            employeeId = faker.number.int(9999);
        }
        employeeData = {
            empPicture: null,
            employeeId: String(employeeId),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
        }
        response = await pimPage.addEmployeeByIdWithApi(employeeData);
    });

    const firstName = faker.person.firstName();
    await test.step('Open created employee and edit first name', async () => {
        await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/${response.data.empNumber}`);
        await page.waitForLoadState('networkidle');

        await pimPage.employeePersonalDetails.firstNameField.fill(firstName);
        await pimPage.clickSaveEmployeePersonalDetails();
    });

    await test.step('Check if first name was edited', async () => {
        let personalData = await pimPage.getEmployeePersonalDetailsByIdWithApi(response.data.empNumber);
        expect(personalData.empNumber).toBe(response.data.empNumber);
        expect(personalData.firstName).toBe(firstName);
        expect(personalData.middleName).toBe(employeeData.middleName);
        expect(personalData.lastName).toBe(employeeData.lastName);
        expect(personalData.employeeId).toBe(employeeData.employeeId);
    });

    await test.step('Delete employee', async () => {
        await pimPage.deleteEmployeeByIdWithApi([response.data.empNumber]);
    });
});

test('Verify search functionality in the employee list by name', async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    const pimPage = new PimPage(page, apiContext, token);
    const employeesList = await pimPage.getEmployeesWithApi();

    const randomIdEmployees = Math.floor(Math.random() * employeesList.length);

    await pimPage.fillEmployeeNameFilter((employeesList[randomIdEmployees].firstName + ' ' + employeesList[randomIdEmployees].middleName + ' ' + employeesList[randomIdEmployees].lastName).replace(/\s{2,}/, ' ').trim());
    await pimPage.clickEmployeeSearchButton();

    await expect(pimPage.employeeList.table.firstName).toHaveText((employeesList[randomIdEmployees].firstName + ' ' + employeesList[randomIdEmployees].middleName).trim());
    await expect(pimPage.employeeList.table.lastName).toHaveText(employeesList[randomIdEmployees].lastName);
});

test('Verify search functionality in the employee list by id', async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    const pimPage = new PimPage(page, apiContext, token);
    const employeesList = await pimPage.getEmployeesWithApi();

    const randomIdEmployees = Math.floor(Math.random() * employeesList.length);

    await pimPage.employeeList.filters.employeeId.fill(employeesList[randomIdEmployees].employeeId);
    await pimPage.clickEmployeeSearchButton();

    await expect(pimPage.employeeList.table.id).toHaveText(employeesList[randomIdEmployees].employeeId);
    await expect(pimPage.employeeList.table.firstName).toHaveText((employeesList[randomIdEmployees].firstName + ' ' + employeesList[randomIdEmployees].middleName).trim());
    await expect(pimPage.employeeList.table.lastName).toHaveText(employeesList[randomIdEmployees].lastName);
});

test('Validate the ability to upload a profile picture for an new employee', async () => {
    const pimPage = new PimPage(page, apiContext, token);
    let response;
    let employeeData;

    await test.step('Add new employee with API', async () => {

        const employeesList = await pimPage.getEmployeesWithApi();
        const allEmployeesIds = [];
        employeesList.map(e => {
            allEmployeesIds.push(e.employeeId);
        });

        let employeeId = faker.number.int(9999);
        while (allEmployeesIds.some(e => e === (String(employeeId)))) {
            employeeId = faker.number.int(9999);
        }
        employeeData = {
            empPicture: null,
            employeeId: String(employeeId),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
        }
        response = await pimPage.addEmployeeByIdWithApi(employeeData);
    });

    await test.step('Open created employee and add picture', async () => {
        await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/${response.data.empNumber}`);
        await page.waitForLoadState('networkidle');

        await pimPage.uploadImage('tests/Homework4/img.jpg');
    });

    await test.step('Check if image is valid', async () => {
        await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/${response.data.empNumber}`);
        await page.waitForLoadState('networkidle');
        expect(await page.locator(".orangehrm-edit-employee-image").screenshot())
            .toMatchSnapshot("imgForValidate.png");
    });

    await test.step('Delete employee', async () => {
        await pimPage.deleteEmployeeByIdWithApi([response.data.empNumber]);
    });
});

test('Add time in My Timesheet', async ({browser}) => {
    const pimPage = new PimPage(page, apiContext, token);
    const adminPage = new AdminPage(page, apiContext, token);
    const timesheetsPage = new TimesheetsPage(page, apiContext, token);

    let customerId;
    await test.step('Add Customer', async () => {
        const customerData = {
            name: faker.lorem.words({min: 2, max: 4}),
            description: faker.lorem.words({min: 4, max: 7}),
        };
        await timesheetsPage.addCustomerWithApi(customerData);
        customerId = await timesheetsPage.getCustomerIdByDataWithApi(customerData);
    });

    let projectId;
    let projectData;
    await test.step('Add project', async () => {
        projectData = {
            customerId: Number(customerId),
            description: null,
            name: faker.lorem.words({min: 2, max: 4}),
            projectAdminsEmpNumbers: []
        };
        await timesheetsPage.addProjectWithApi(projectData);
        projectId = await timesheetsPage.getProjectIdByDataWithApi(projectData);
    });

    let projectActivities;
    await test.step('Add activities in project', async () => {
        projectActivities = [faker.lorem.words({min: 1, max: 2}),
            faker.lorem.words({min: 1, max: 2}),
            faker.lorem.words({min: 1, max: 2})];

        console.log(projectActivities);

        for (let i = 0; i < projectActivities.length; i++) {
            await timesheetsPage.addActivitiesInProjectWithApi(projectId, projectActivities[i]);
        }
    });


    let newUserData;
    let employeesList;
    let userData;

    await test.step('Create new user', async () => {
        employeesList = await pimPage.getEmployeesWithApi();
        userData = {
            username: faker.internet.username(),
            password: faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'}),
            status: true,
            userRoleId: 1,
            empNumber: employeesList[0].empNumber,
        }
        newUserData = await adminPage.addUserWithApi(userData);
    });

    const newContext = await browser.newContext({viewport: {height: 900, width: 1600}});
    const newPage = await newContext.newPage();
    const secondWindowLoginPage = new LoginPage(newPage);

    await test.step('Login to new user', async () => {
        await secondWindowLoginPage.validLoginOrangeHr(userData.username, userData.password);
    });


    const secondWindowTimesheetsPage = new TimesheetsPage(newPage);
    let timesheet;
    await test.step('Add time in timesheet ', async () => {
        await newPage.goto('https://opensource-demo.orangehrmlive.com/web/index.php/time/viewMyTimesheet');
        await secondWindowTimesheetsPage.myTimesheet.editButton.click();


        timesheet = [{
            project: projectData.name,
            activity: projectActivities[0],
            mon: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            tue: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            wed: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            thu: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            fri: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            sat: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            sun: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
        },
            {
                project: projectData.name,
                activity: projectActivities[1],
                mon: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                tue: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                wed: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                thu: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                fri: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                sat: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                sun: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            },
            {
                project: projectData.name,
                activity: projectActivities[2],
                mon: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                tue: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                wed: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                thu: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                fri: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                sat: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
                sun: String(faker.number.int({min: 0, max: 5}))+':'+String(faker.number.int({min: 10, max: 40})),
            }]

        await secondWindowTimesheetsPage.myTimesheet.editTimesheet.addRowButton.click();
        await secondWindowTimesheetsPage.myTimesheet.editTimesheet.addRowButton.click();
        await secondWindowTimesheetsPage.addTimesheet(timesheet[0], 1);
        await secondWindowTimesheetsPage.addTimesheet(timesheet[1], 2);
        await secondWindowTimesheetsPage.addTimesheet(timesheet[2], 3);

        await secondWindowTimesheetsPage.clickSaveTimesheet();
    });

    await secondWindowTimesheetsPage.checkTimesheet(timesheet);

    await test.step('Delete user', async () => {
        await adminPage.deleteUserWithApi([newUserData.id]);
    });
});


test('test', async ({page}) => {
    await page.goto('https://magento.softwaretestingboard.com/')

    await expect(page.locator('#ui-id-2 > li:nth-child(2) > a span:nth-child(2)')).toHaveText('Women');
    await page.locator('#ui-id-2 > li:nth-child(2) > a span:nth-child(2)').hover();
    await expect(page.locator('#ui-id-2 > li:nth-child(2) > ul > li:nth-child(1) span:nth-child(2)')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(2) > ul > li:nth-child(1) span:nth-child(2)')).toHaveText('Tops');
    await expect(page.locator('#ui-id-2 > li:nth-child(2) > ul > li:nth-child(2) span:nth-child(2)')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(2) > ul > li:nth-child(2) span:nth-child(2)')).toHaveText('Bottoms');

    await expect(page.locator('#ui-id-2 > li:nth-child(3) > a span:nth-child(2)')).toHaveText('Men');
    await page.locator('#ui-id-2 > li:nth-child(3) > a span:nth-child(2)').hover();
    await expect(page.locator('#ui-id-2 > li:nth-child(3) > ul > li:nth-child(1) span:nth-child(2)')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(3) > ul > li:nth-child(1) span:nth-child(2)')).toHaveText('Tops');
    await expect(page.locator('#ui-id-2 > li:nth-child(3) > ul > li:nth-child(2) span:nth-child(2)')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(3) > ul > li:nth-child(2) span:nth-child(2)')).toHaveText('Bottoms');

    await expect(page.locator('#ui-id-2 > li:nth-child(4) > a span:nth-child(2)')).toHaveText('Gear');
    await page.locator('#ui-id-2 > li:nth-child(4) > a span:nth-child(2)').hover();
    await expect(page.locator('#ui-id-2 > li:nth-child(4) > ul > li:nth-child(1) span')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(4) > ul > li:nth-child(1) span')).toHaveText('Bags');
    await expect(page.locator('#ui-id-2 > li:nth-child(4) > ul > li:nth-child(2) span')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(4) > ul > li:nth-child(2) span')).toHaveText('Fitness Equipment');

    await expect(page.locator('#ui-id-2 > li:nth-child(5) > a span:nth-child(2)')).toHaveText('Training');
    await page.locator('#ui-id-2 > li:nth-child(5) > a span:nth-child(2)').hover();
    await expect(page.locator('#ui-id-2 > li:nth-child(5) > ul > li:nth-child(1) span')).toBeVisible();
    await expect(page.locator('#ui-id-2 > li:nth-child(5) > ul > li:nth-child(1) span')).toHaveText('Video Download');
});