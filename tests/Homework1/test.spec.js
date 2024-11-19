const {test, expect} = require("@playwright/test");
const {orangehrmliveLocators} = require("./orangehrmliveLocators");
import {faker} from '@faker-js/faker';

let page;
let context;
test.beforeEach(async ({browser}) => {
    context = await browser.newContext({viewport: {height: 900, width: 1600}});
    page = await context.newPage();
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    await page.locator(orangehrmliveLocators.loginPage.nameField).fill('Admin');
    await page.locator(orangehrmliveLocators.loginPage.passwordField).fill('admin123');
    await page.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await page.waitForLoadState('networkidle');
});

test('Check search by user name', async () => {
    await page.locator(orangehrmliveLocators.navigation.replace('namePage', 'Admin')).click();
    await page.waitForLoadState('networkidle');

    let allNames = await page.locator(orangehrmliveLocators.adminPage.users.table.nameRow).allTextContents();


    const randomName = allNames[Math.floor(Math.random() * allNames.length - 1)];

    await page.locator(orangehrmliveLocators.adminPage.users.filters.nameField).fill(randomName);
    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users?limit') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.adminPage.users.filters.searchButton).click(),
    ])

    allNames = await page.locator(orangehrmliveLocators.adminPage.users.table.nameRow).allTextContents();
    allNames.map(e => expect(e).toContain(randomName));
});

test('Create non admin user and check that he does not have access to the admin panel', async () => {
    const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
    const employeeName = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=1',
        {
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => response.data[0].firstName);

    await page.locator(orangehrmliveLocators.navigation.replace('namePage', 'Admin')).click();
    await page.waitForLoadState('networkidle');

    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.addNewUserButton).click();
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.userRoleDropdown).click();
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.dropdownValue.replace('value', 'ESS')).click();
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.employeeName.field).fill(employeeName);
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.employeeName.list).first().click();
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.statusDropdown).click();
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.dropdownValue.replace('value', 'Enabled')).click();

    const userName = faker.internet.username();
    const pass = faker.internet.password({length: 20, pattern: /[a-z]/, prefix: '!Q1'});

    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.userNameField).fill(userName);
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.passwordField).fill(pass);
    await page.locator(orangehrmliveLocators.adminPage.users.addNewUser.confirmPasswordField).fill(pass);


    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users') &&
            resp.status() === 200 && resp.request().method() === 'POST'),
        page.locator(orangehrmliveLocators.adminPage.users.addNewUser.saveButton).click(),
    ]);

    await page.locator(orangehrmliveLocators.userTopMenu.menuButton).click();
    await page.locator(orangehrmliveLocators.userTopMenu.logOutButton).click();

    await page.locator(orangehrmliveLocators.loginPage.nameField).fill(userName);
    await page.locator(orangehrmliveLocators.loginPage.passwordField).fill(pass);
    await page.locator(orangehrmliveLocators.loginPage.loginButton).click();
    await page.waitForLoadState('networkidle');

    const navigations = await page.locator(orangehrmliveLocators.navigation.replace(':text-is("namePage")', '')).allTextContents();

    expect(navigations).not.toContainEqual('Admin');
    expect(navigations).not.toContainEqual('PIM');
    expect(navigations).not.toContainEqual('Maintenance');

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');

    await expect(page.locator('.oxd-text.oxd-text--p.oxd-alert-content-text')).toHaveText('Credential Required');
});

test('Add and delete Job Titles', async () => {
    await page.locator(orangehrmliveLocators.navigation.replace('namePage', 'Admin')).click();
    await page.waitForLoadState('networkidle');

    await page.locator(orangehrmliveLocators.adminPage.topMenu.job.jobButton).click();
    await page.locator(orangehrmliveLocators.adminPage.topMenu.job.jobTitleButton).click();
    await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.addButton).click();

    const jobTitle = faker.person.jobTitle();
    const jobDescription = faker.word.words({count: {min: 3, max: 6}});

    await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.addForm.jobTitleField).fill(jobTitle);
    await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.addForm.jobDescriptionField).fill(jobDescription);

    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/job-titles?limit') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.addForm.saveButton).click(),
    ]);

    let dataFromTable = {
        title: await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.table.title).allTextContents(),
        description: await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.table.description).allTextContents(),
    };

    expect(dataFromTable.title).toContainEqual(jobTitle);
    let jobIndex;

    dataFromTable.title.map((e, i) => {
        if (e === jobTitle) {
            expect(dataFromTable.description[i]).toBe(jobDescription);
            jobIndex = i;
        }
    });

    await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.table.checkBox).nth(jobIndex).click();
    await page.locator(orangehrmliveLocators.deleteButton).click();

    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/job-titles?limit') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.deleteModal.yes).click(),
    ]);

    dataFromTable = {
        title: await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.table.title).allTextContents(),
        description: await page.locator(orangehrmliveLocators.adminPage.jobTitlesPage.table.description).allTextContents(),
    };
    expect(dataFromTable.title).not.toContainEqual(jobTitle);
});

test('Add and delete Vacancies', async () => {
    const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
    const employeeName = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=1',
        {
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => response.data[0].firstName);

    await page.locator(orangehrmliveLocators.navigation.replace('namePage', 'Recruitment')).click();
    await page.waitForLoadState('networkidle');
    await page.locator(orangehrmliveLocators.recruitmentPage.topMenu.vacancies).click();

    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addButton).click();

    const vacancyName = faker.person.jobType();
    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.vacancyNameField).fill(vacancyName);

    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.jobTitleDropdown).click();
    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.dropdownValue).first().click();

    const jobTitle = await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.jobTitleDropdown).textContent();

    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.hiringManagerField.field).fill(employeeName);
    await page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.hiringManagerField.list).first().click();

    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/core/validation/unique?value') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.recruitmentPage.vacancies.addForm.saveButton).click(),
    ]);

    await page.waitForResponse(resp =>
        resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/core/validation/unique?value') &&
        resp.status() === 200);

    const vacanciesList = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/vacancies?limit=1000&offset=0&sortField=vacancy.name&sortOrder=ASC&model=detailed',
        {
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            }
        }).then(response => response.json()).then(response => response.data);

    let idVacancies;

    vacanciesList.map(e => {
        if (e.name === vacancyName && e.jobTitle.title === jobTitle && employeeName.includes(e.hiringManager.firstName)) {
            idVacancies = e.id;
        }
    });

    await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/vacancies',
        {
            method: "DELETE",
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: [idVacancies]
            }),
        }).then(response => expect(response.status).toBe(200));
});

test('Testing sending a CV for a vacancy', async () => {
    const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
    const employeeData = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=1',
        {
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => response.data[0]);

    const jobData = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/job-titles?limit=1',
        {
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => response.data[0]);

    const vacancyName = faker.person.jobType();
    const vacancyData = await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/vacancies',
        {
            method: "POST",
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: vacancyName,
                jobTitleId: jobData.id,
                employeeId: employeeData.empNumber,
                numOfPositions: null,
                description: '',
                status: true,
                isPublished: true,
            }),
        }).then(response => response.json()).then(response => response.data);

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitmentApply/jobs.html');
    await page.locator(orangehrmliveLocators.publishVacancyPage.applyButton.replace('VacancyName', vacancyName)).click();

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();

    await page.locator(orangehrmliveLocators.publishVacancyPage.addForm.firstNameField).fill(firstName);
    await page.locator(orangehrmliveLocators.publishVacancyPage.addForm.lastNameField).fill(lastName);
    await page.locator(orangehrmliveLocators.publishVacancyPage.addForm.emailField).fill(email);
    await page.setInputFiles(orangehrmliveLocators.publishVacancyPage.addForm.resumeField, 'tests/Homework1/resume.txt');
    await page.locator(orangehrmliveLocators.publishVacancyPage.addForm.submitButton).click();

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates');
    await page.waitForLoadState('networkidle');

    await page.locator(orangehrmliveLocators.recruitmentPage.candidates.filters.candidateNameField).fill(firstName);
    await page.locator(orangehrmliveLocators.recruitmentPage.candidates.filters.list).click();

    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/candidates?limit=50') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.recruitmentPage.candidates.filters.searchButton).click(),
    ]);

    await expect(page.locator(orangehrmliveLocators.recruitmentPage.candidates.table.vacancy).first()).toHaveText(vacancyData.name);
    await expect(page.locator(orangehrmliveLocators.recruitmentPage.candidates.table.candidate).first()).toHaveText(firstName + ' ' + lastName);
    await expect(page.locator(orangehrmliveLocators.recruitmentPage.candidates.table.hiringManager).first())
        .toHaveText((employeeData.firstName + ' ' + employeeData.middleName + ' ' + employeeData.lastName).replace(/\s+/g, ' '));

    await page.locator(orangehrmliveLocators.recruitmentPage.candidates.table.checkBox).first().click();
    await page.locator(orangehrmliveLocators.deleteButton).click();

    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/candidates') &&
            resp.status() === 200),
        page.locator(orangehrmliveLocators.deleteModal.yes).click(),
    ]);

    await fetch('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/vacancies',
        {
            method: "DELETE",
            headers: {
                'cookie': 'orangehrm=' + cookiesValue[0].value,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: [vacancyData.id]
            }),
        }).then(response => expect(response.status).toBe(200));
});