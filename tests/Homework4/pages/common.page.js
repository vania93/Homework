exports.CommonPage = class commonPage {
    constructor(page) {
        this.page = page;
        this.userTopMenu = {
            menuButton: page.locator('.oxd-userdropdown-name'),
            logOutButton: page.locator('.oxd-dropdown-menu > li:nth-child(4)'),
        };
    }

    async logOut() {
        await this.userTopMenu.menuButton.click();
        await this.userTopMenu.logOutButton.click();
    }
}