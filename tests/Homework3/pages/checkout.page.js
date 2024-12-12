const {expect} = require("@playwright/test");
exports.CheckoutPage = class checkoutPage {
    constructor(page) {
        this.page = page;
        this.emailField = page.locator('#shipping [type="email"]');
        this.firstNameField = page.locator('#shipping-new-address-form > div:nth-child(1) input');
        this.lastNameField = page.locator('#shipping-new-address-form > div:nth-child(2) input');
        this.streetAddressField = page.locator('#shipping-new-address-form > fieldset div:nth-child(1) input');
        this.cityField = page.locator('#shipping-new-address-form > div:nth-child(5) input');
        this.stateDropdown = page.locator('#shipping-new-address-form > div:nth-child(6) select');
        this.zipField = page.locator('#shipping-new-address-form > div:nth-child(8) input');
        this.countryDropdown = page.locator('#shipping-new-address-form > div:nth-child(9) select');
        this.phoneNumberField = page.locator('#shipping-new-address-form > div:nth-child(10) input');
        this.shippingMethodsRadioButton = page.locator('#checkout-shipping-method-load tbody > tr > td:nth-child(1)');
        this.nextButton = page.locator('#shipping-method-buttons-container [type="submit"]');
        this.placeOrderButton = page.locator('.payment-method._active [type="submit"]');
        this.thankYouAlert = page.locator('[data-ui-id="page-title-wrapper"]');
    }

    async fillShippingAddress(address) {
        await Promise.all([
            this.emailField.fill(address.email),
            this.page.waitForResponse(resp =>
                resp.url().includes('https://magento.softwaretestingboard.com/rest/default/V1/customers/isEmailAvailable') &&
                resp.status() === 200),
        ]);
        await this.firstNameField.fill(address.firstName);
        await this.lastNameField.fill(address.lastName);
        await this.streetAddressField.fill(address.streetAddress);
        await this.cityField.fill(address.city);
        await Promise.all([
            this.stateDropdown.selectOption(address.state),
            this.page.waitForResponse(resp =>
                resp.url().includes('/estimate-shipping-methods') &&
                resp.status() === 200),
        ]);
        await Promise.all([
            await this.zipField.fill(address.zip),
            await this.phoneNumberField.focus(),
            this.page.waitForResponse(resp =>
                resp.url().includes('/estimate-shipping-methods') &&
                resp.status() === 200),

        ]);
        await this.phoneNumberField.fill(address.phoneNumber);
        await this.shippingMethodsRadioButton.nth(0).click();
    };

    async clickNextButton() {
        await this.nextButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickPlaceOrderButton() {
        await this.placeOrderButton.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.thankYouAlert).toHaveText('Thank you for your purchase!',{timeout:30000});
    }
}