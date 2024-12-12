const {expect} = require("@playwright/test");
exports.ProductDetailsPage = class productDetailsPage {
    constructor(page) {
        this.page = page;
        this.alert = page.locator('[role="alert"] > div > [data-bind]');
        this.detailsTab = {
            tab: page.locator('#tab-label-description-title'),
            text: page.locator('.product.attribute.description'),
        };
        this.moreInfoTab = {
            tab: page.locator('#tab-label-additional'),
            style: page.locator('[data-th="Style"]'),
            material: page.locator('[data-th="Material"]'),
            pattern: page.locator('[data-th="Pattern"]'),
            climate: page.locator('[data-th="Climate"]'),
        };
        this.productInfoMain = {
            title: page.locator('.product-info-main [itemprop="name"]'),
            price: page.locator('.product-info-main .price'),
            sku: page.locator('.product-info-main [itemprop="sku"]'),
            addToCompareButton: page.locator('.product-info-main .action.tocompare'),
            size: page.locator('.swatch-attribute.size > div > div'),
            color: page.locator('.swatch-attribute.color > div > div'),
            addToCardButton: page.locator('#product-addtocart-button'),
        }
    }

    async clickOnMoreInfoTab() {
        await this.moreInfoTab.tab.click();
    }

    async clickOnAddToCompareButton() {
        await this.productInfoMain.addToCompareButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async getProductData() {
        return {
            title: await this.productInfoMain.title.textContent(),
            price: await this.productInfoMain.price.textContent(),
            sku: await this.productInfoMain.sku.textContent(),
            description: (await this.detailsTab.text.textContent()).trim(),
        };
    }

    async clickOnAddToCardButton() {
        await this.productInfoMain.addToCardButton.click();
        await expect(this.alert).toContainText('You added');
    }
}