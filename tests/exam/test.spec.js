const {test, expect, request} = require("@playwright/test");
const {PimPage} = require("../exam/pages/pim.page");
const {faker} = require("@faker-js/faker");
const {LoginPage} = require("../exam/pages/login.page");
const {AdminPage} = require("../exam/pages/admin.page");

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
test.only('Validate the ability to upload a profile picture for an new employee', async ({browser}) => {
    const pimPage = new PimPage(page, apiContext, token);
    const adminPage = new AdminPage(page, apiContext, token);
    let employeeResponse;
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
            firstName: 'first',
            lastName: 'last',
            middleName: 'middle',
        }
        employeeResponse = await pimPage.addEmployeeByIdWithApi(employeeData);
    });

    await test.step('Open created employee and add picture', async () => {
        await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/${employeeResponse.data.empNumber}`);
        await page.waitForLoadState('networkidle');
        await pimPage.uploadImage('tests/exam/img.jpg');
    });

    await test.step('Check if image is valid', async () => {
        await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/${employeeResponse.data.empNumber}`);
        await page.waitForLoadState('networkidle');
        expect(await pimPage.employeePersonalDetails.employeeImage.screenshot())
            .toMatchSnapshot("imgForValidate.png");
    });

    let userData;
    let newUserData;
    await test.step('Create new user with current employee', async () => {
        userData = {
            username: faker.internet.username(),
            password: faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'}),
            status: true,
            userRoleId: 1,
            empNumber: employeeResponse.data.empNumber,
        }
        newUserData = await adminPage.addUserWithApi(userData);
    });

    const newContext = await browser.newContext({viewport: {height: 900, width: 1600}});
    const newPage = await newContext.newPage();
    const secondWindowLoginPage = new LoginPage(newPage);

    await test.step('Login to new user', async () => {
        await secondWindowLoginPage.validLoginOrangeHr(userData.username, userData.password);
    });

    await test.step('Check if image for user is valid', async () => {
        expect(await secondWindowLoginPage.userImg.screenshot())
            .toMatchSnapshot("userImg.png");
    });

    await test.step('Delete user', async () => {
        await adminPage.deleteUserWithApi([newUserData.id]);
    });

    await test.step('Delete employee', async () => {
        await pimPage.deleteEmployeeByIdWithApi([employeeResponse.data.empNumber]);
    });
});