exports.ProductDetailsPage = class productDetailsPage {
    constructor(page) {
        this.page = page;
        this.detailsTab = {
            tab: page.locator('#tab-label-description-title'),
            text: page.locator('.product.attribute.description'),
        };
        this.moreInfoTab = {
            tab: page.locator('#tab-label-additional'),
            climate: page.locator('[data-th="Climate"]'),
            material: page.locator('[data-th="Material"]'),
        };
        this.productInfoMain = {
            title: page.locator('.product-info-main [itemprop="name"]'),
            price: page.locator('.product-info-main .price'),
            sku: page.locator('.product-info-main [itemprop="sku"]'),
            addToCompareButton: page.locator('.product-info-main .action.tocompare'),
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
}