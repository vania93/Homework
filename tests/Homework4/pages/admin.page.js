const {expect} = require("@playwright/test");
exports.AdminPage = class adminPage {
    constructor(page, apiContext, token) {
        this.page = page;
        this.apiContext = apiContext;
        this.token = token;
    }

    async addUserWithApi(userData) {
        const response = await this.apiContext.post(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users',
            {
                data: userData,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
        expect(response.status()).toBe(200);
        const userDetails = await response.json();
        return userDetails.data;
    }

    async deleteUserWithApi(userIds) {
        const response = await this.apiContext.delete('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users',
            {
                data: {
                    ids: userIds,
                },
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
    }
};
