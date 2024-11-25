import {expect, test, request} from "@playwright/test";
import {faker} from '@faker-js/faker';

const {orangehrmliveLocators} = require("../Homework1/orangehrmliveLocators");
const {APIUtils} = require("./APIUtils");

let page;
let context;
let token;
test.beforeAll(async ({browser}) => {
    context = await browser.newContext({viewport: {height: 900, width: 1600}});
    page = await context.newPage();
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    await page.locator(orangehrmliveLocators.loginPage.nameField).fill('Admin');
    await page.locator(orangehrmliveLocators.loginPage.passwordField).fill('admin123');
    await page.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await page.waitForLoadState('networkidle');

    const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
    token = cookiesValue[0].value;
    await context.addCookies([
        {name: 'orangehrm', value: token, path: '/', domain: 'opensource-demo.orangehrmlive.com'}
    ]);
});

test('Add and delete user', async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, token);
    const employeesList = await apiUtils.getEmployees();

    const userData = {
        username: faker.internet.username(),
        password: faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'}),
        status: true,
        userRoleId: 1,
        empNumber: employeesList[0].empNumber,
    }
    const newUserData = await apiUtils.addUser(userData);

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');
    await page.locator(orangehrmliveLocators.adminPage.users.filters.nameField).fill(userData.username);
    await page.locator(orangehrmliveLocators.adminPage.users.filters.searchButton).click();
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.nameRow)).toHaveCount(1);
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.nameRow)).toHaveText(userData.username);
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.userRole)).toHaveText('Admin');
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.employeeRow)).toHaveText((employeesList[0].firstName + ' ' + employeesList[0].lastName).trim());
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.statusRow)).toHaveText('Enabled');

    await apiUtils.deleteUser([newUserData.id]);
    await page.locator(orangehrmliveLocators.adminPage.users.filters.searchButton).click();
    await expect(page.locator(orangehrmliveLocators.adminPage.users.table.nameRow)).toHaveCount(0);
    await expect(page.locator(orangehrmliveLocators.toastMessage)).toHaveText('No Records Found');
});

test('Add and delete Newsfeed', async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, token);

    const newsfeed = {
        type: "text",
        text: faker.lorem.words({min: 2, max: 5}),
    }
    const newsfeedId = await apiUtils.addNewsfeed(newsfeed);

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/buzz/viewBuzz');
    await page.locator(orangehrmliveLocators.buzzPage.posts.body).first().waitFor({state: 'visible'});
    let allNews = await page.locator(orangehrmliveLocators.buzzPage.posts.body).allTextContents();

    expect(allNews).toContainEqual(newsfeed.text);

    await apiUtils.deleteNewsfeed(newsfeedId);
    await page.reload();
    await page.locator(orangehrmliveLocators.buzzPage.posts.body).first().waitFor({state: 'visible'});
    allNews = await page.locator(orangehrmliveLocators.buzzPage.posts.body).allTextContents();
    expect(allNews).not.toContainEqual(newsfeed.text);
});

test('Add and delete Skills', async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, token);

    const skill = {
        name: faker.person.jobTitle(),
        description: faker.lorem.words({min: 2, max: 5}),
    }

    const skillId = await apiUtils.addSkill(skill);

    await Promise.all([
        page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSkills'),
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills?limit=50&offset=0') &&
            resp.status() === 200),
    ]);

    let dataFromTable = {
        title: await page.locator(orangehrmliveLocators.adminPage.skills.table.name).allTextContents(),
        description: await page.locator(orangehrmliveLocators.adminPage.skills.table.description).allTextContents(),
    };

    expect(dataFromTable.title).toContainEqual(skill.name);

    dataFromTable.title.map((e, i) => {
        if (e === skill.name) {
            expect(dataFromTable.description[i]).toBe(skill.description);
        }
    });

    await apiUtils.deleteSkill([skillId]);

    await Promise.all([
        page.reload(),
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills?limit=50&offset=0') &&
            resp.status() === 200),
    ]);

    dataFromTable = {
        title: await page.locator(orangehrmliveLocators.adminPage.skills.table.name).allTextContents(),
        description: await page.locator(orangehrmliveLocators.adminPage.skills.table.description).allTextContents(),
    };

    expect(dataFromTable.title).not.toContainEqual(skill.name);
});

test('Change description skill', async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, token);

    await Promise.all([
        page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSkills'),
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills?limit=50&offset=0') &&
            resp.status() === 200),
    ]);

    const randomSkillIndex = Math.floor(Math.random() * await page.locator(orangehrmliveLocators.adminPage.skills.table.name).count());

    let dataFromTable = {
        title: await page.locator(orangehrmliveLocators.adminPage.skills.table.name).nth(randomSkillIndex).textContent(),
        description: await page.locator(orangehrmliveLocators.adminPage.skills.table.description).nth(randomSkillIndex).textContent(),
    };

    await Promise.all([
        await page.locator(orangehrmliveLocators.adminPage.skills.table.editButton).nth(randomSkillIndex).click(),
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/core/validation/unique?value') &&
            resp.status() === 200),
    ]);

    await page.locator(orangehrmliveLocators.adminPage.skills.addEditForm.descriptionField).waitFor({state: 'visible'});
    const skillId = (await page.url()).match(/\d+$/)[0];

    let description = faker.lorem.words({min: 2, max: 5})

    await page.locator(orangehrmliveLocators.adminPage.skills.addEditForm.descriptionField).fill(description);
    await Promise.all([
        await page.locator(orangehrmliveLocators.adminPage.skills.addEditForm.saveButton).click(),
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills') &&
            resp.status() === 200),
    ]);

    const allSkills = await apiUtils.getSkills();
    expect(allSkills).toContainEqual({description: description, id: Number(skillId), name: dataFromTable.title})
});

test('Change pass for user', async ({browser}) => {
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, token);
    const employeesList = await apiUtils.getEmployees();

    const userData = {
        username: faker.internet.username(),
        password: faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'}),
        status: true,
        userRoleId: 2,
        empNumber: employeesList[0].empNumber,
    }
    const newUserData = await apiUtils.addUser(userData);

    const newContext = await browser.newContext({viewport: {height: 900, width: 1600}});
    const newPage = await newContext.newPage();
    await newPage.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    await newPage.locator(orangehrmliveLocators.loginPage.nameField).fill(userData.username);
    await newPage.locator(orangehrmliveLocators.loginPage.passwordField).fill(userData.password);
    await newPage.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await newPage.waitForLoadState('networkidle');

    await newPage.locator(orangehrmliveLocators.userTopMenu.menuButton).click();
    await newPage.locator(orangehrmliveLocators.userTopMenu.logOutButton).click();

    const oldPass = userData.password;

    userData['changePassword'] = true;
    userData.password = faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'});

    await apiUtils.editUser(newUserData.id, userData);

    await newPage.locator(orangehrmliveLocators.loginPage.nameField).fill(userData.username);
    await newPage.locator(orangehrmliveLocators.loginPage.passwordField).fill(oldPass);
    await newPage.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await newPage.waitForLoadState('networkidle');

    await expect(newPage.locator('.oxd-alert-content > p')).toHaveText('Invalid credentials');

    await newPage.locator(orangehrmliveLocators.loginPage.nameField).fill(userData.username);
    await newPage.locator(orangehrmliveLocators.loginPage.passwordField).fill(userData.password);
    await newPage.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await newPage.waitForLoadState('networkidle');

    await expect(newPage.locator(orangehrmliveLocators.userTopMenu.menuButton)).toBeVisible();

    await apiUtils.deleteUser([newUserData.id]);
});