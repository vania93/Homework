const {expect} = require("@playwright/test");
exports.CompareProductsPage = class compareProductsPage {
    constructor(page) {
        this.page = page;
        this.productTitle = page.locator('[data-th="Product"] .product-item-name a');
        this.productPrice = page.locator('[data-th="Product"] .price');
        this.productSku = page.locator('tbody > tr:nth-child(1) .cell.product.attribute .attribute.value');
        this.productDescription = page.locator('tbody > tr:nth-child(2) .cell.product.attribute .attribute.value');
    }

    async getProductsData() {
        let productsData = [];

        for (let i = 0; i < await this.productTitle.count(); i++)
            productsData.push({
                title: (await this.productTitle.nth(i).textContent()).trim(),
                price: (await this.productPrice.nth(i).textContent()).trim(),
                sku: (await this.productSku.nth(i).textContent()).trim(),
                description: (await this.productDescription.nth(i).textContent()).trim(),
            });
        return productsData;
    }

    async compareProductDataWith(data) {
        const thisData = await this.getProductsData();
        expect(thisData.length).toEqual(data.length);

        thisData.map(async (e) => {
            expect(data).toContainEqual(e);
        })
    }
}