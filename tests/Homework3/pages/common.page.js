exports.CommonPage = class commonPage {
    constructor(page) {
        this.page = page;
        this.cart = {
            button: page.locator('.action.showcart'),
            proceedToCheckoutButton: page.locator('#top-cart-btn-checkout'),
        };
    }

    async clickOnProceedToCheckoutButton() {
        await this.cart.proceedToCheckoutButton.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForSelector('#shipping [type="email"]');
    }
}