import {faker} from '@faker-js/faker';
import {expect, request} from "@playwright/test";
import {AdminPage} from "./pages/admin.page";
import {CommonPage} from "./pages/common.page";

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

test.only('Verify that a new employee can be added with all mandatory fields filled', async () => {
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

test.only('Verify just deleted user can not access the system', async ({browser}) => {
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

test.only('Verify that employee details can be edited and saved successfully', async () => {
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

test.only('Verify search functionality in the employee list by name', async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    const pimPage = new PimPage(page, apiContext, token);
    const employeesList = await pimPage.getEmployeesWithApi();

    const randomIdEmployees = Math.floor(Math.random() * employeesList.length);

    await pimPage.fillEmployeeNameFilter((employeesList[randomIdEmployees].firstName + ' ' + employeesList[randomIdEmployees].middleName + ' ' + employeesList[randomIdEmployees].lastName).replace(/\s{2,}/, ' ').trim());
    await pimPage.clickEmployeeSearchButton();

    await expect(pimPage.employeeList.table.firstName).toHaveText((employeesList[randomIdEmployees].firstName + ' ' + employeesList[randomIdEmployees].middleName).trim());
    await expect(pimPage.employeeList.table.lastName).toHaveText(employeesList[randomIdEmployees].lastName);
});

test.only('Verify search functionality in the employee list by id', async () => {
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

test.only('Validate the ability to upload a profile picture for an new employee', async () => {
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