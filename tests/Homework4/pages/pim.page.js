const {expect} = require("@playwright/test");
exports.PimPage = class pimPage {
    constructor(page, apiContext, token) {
        this.page = page;
        this.apiContext = apiContext;
        this.token = token;
        this.employeeList = {
            filters: {
                employeeName: {
                    field: page.locator('.oxd-grid-4.orangehrm-full-width-grid > div:nth-child(1) [placeholder="Type for hints..."]'),
                    list: page.locator('[role="option"] > span'),
                },
                employeeId: page.locator('.oxd-grid-4.orangehrm-full-width-grid > div:nth-child(2) input'),
                searchButton: page.locator('[type="submit"]'),
            },
            addButton: page.locator('.orangehrm-header-container > button'),
            table: {
                id: page.locator('.oxd-table-body [role="row"] > div:nth-child(2) > div'),
                firstName: page.locator('.oxd-table-body [role="row"] > div:nth-child(3) > div'),
                lastName: page.locator('.oxd-table-body [role="row"] > div:nth-child(4) > div'),
            }
        };
        this.addEmployeeForm = {
            firstNameField: page.locator('[name="firstName"]'),
            middleNameField: page.locator('[name="middleName"]'),
            lastNameField: page.locator('[name="lastName"]'),
            employeeId: page.locator('.orangehrm-employee-form > div:nth-child(1) > div:nth-child(2) input'),
            saveButton: page.locator('.oxd-form-actions > [type="submit"]'),
        };
        this.employeePersonalDetails = {
            firstNameField: page.locator('[name="firstName"]'),
            middleNameField: page.locator('[name="middleName"]'),
            lastNameField: page.locator('[name="lastName"]'),
            employeeImage: page.locator('.orangehrm-edit-employee-image'),
            uploadImageButton: page.locator('.oxd-file-div.oxd-file-div--active > button'),
            saveButton: page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-form-actions > [type="submit"]'),
        };
    }

    async uploadImage(path) {
        await this.employeePersonalDetails.employeeImage.click();
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            await this.employeePersonalDetails.uploadImageButton.click(),
        ]);
        await fileChooser.setFiles(path);
        await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/picture') &&
                response.status() === 200),
            await this.employeePersonalDetails.saveButton.click(),
        ]);
    };

    async fillEmployeeData(employeeData) {
        await this.addEmployeeForm.firstNameField.fill(employeeData.firstName)
        await this.addEmployeeForm.middleNameField.fill(employeeData.middleName)
        await this.addEmployeeForm.lastNameField.fill(employeeData.lastName)
        await this.addEmployeeForm.employeeId.fill(employeeData.employeeId)
    };

    async clickSaveEmployeePersonalDetails() {
        await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/personal-details') &&
                response.status() === 200),
            await this.employeePersonalDetails.saveButton.click(),
        ]);
    };

    async clickSaveEmployeeAndGetResponse() {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp =>
                resp.url().includes('/personal-details') &&
                resp.status() === 200),
            this.addEmployeeForm.saveButton.click(),
        ]);
        return await response.json();
    }

    async addEmployeeByIdWithApi(body) {
        const response = await this.apiContext.post('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees',
            {
                data: body,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
        return await response.json();
    }

    async deleteEmployeeByIdWithApi(id) {
        const response = await this.apiContext.delete('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees',
            {
                data: {
                    ids: id,
                },
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
    }

    async fillEmployeeNameFilter(text) {
        await this.employeeList.filters.employeeName.field.fill(text);
        await this.employeeList.filters.employeeName.list.first().click();
    }

    async clickEmployeeSearchButton() {
        await Promise.all([
            this.page.waitForResponse(resp =>
                resp.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=50') &&
                resp.status() === 200),
            this.employeeList.filters.searchButton.click(),
        ]);
    }

    async getEmployeesWithApi() {
        const response = await this.apiContext.get(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=500&offset=0&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        )
        const employeesList = await response.json();
        return employeesList.data;
    }

    async getEmployeePersonalDetailsByIdWithApi(id) {
        const response = await this.apiContext.get(
            `https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees/${id}/personal-details`,
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        )
        const employeesList = await response.json();
        return employeesList.data;
    }
}