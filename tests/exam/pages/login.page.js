const {expect} = require("@playwright/test");
exports.LoginPage = class loginPage {
    constructor(page) {
        this.page = page;
        this.nameField = page.locator('[name="username"]');
        this.passwordField = page.locator('[type="password"]');
        this.loginButton = page.locator('[type="submit"]');
        this.menuButton = page.locator('.oxd-userdropdown-name');
        this.userImg = page.locator('.oxd-userdropdown-img');
    }

    async validLoginOrangeHr(username, password) {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        await this.nameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.menuButton).toBeVisible();
    }

    async saveSession(context) {
        const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
        await context.addCookies([
            {name: 'orangehrm', value: cookiesValue[0].value, path: '/', domain: 'opensource-demo.orangehrmlive.com'}
        ]);
        return context;
    }

    async getToken(context) {
        const cookiesValue = await context.cookies('https://opensource-demo.orangehrmlive.com/web/index.php');
        return cookiesValue[0].value;
    }
}