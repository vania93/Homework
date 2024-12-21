const {expect} = require("@playwright/test");
exports.PimPage = class pimPage {
    constructor(page, apiContext, token) {
        this.page = page;
        this.apiContext = apiContext;
        this.token = token;
        this.employeePersonalDetails = {
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
}