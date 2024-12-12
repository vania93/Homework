const {expect} = require("@playwright/test");
exports.ProductListPage = class productListPage {
    constructor(page) {
        this.page = page;
        this.compareProductsButton = page.locator('.header.content .action.compare');
        this.search = {
            field: page.locator('#search'),
            autocomplete: page.locator('#search_autocomplete li'),
        };
        this.sortByDropdowm = page.locator('.column.main > div:nth-child(3) #sorter');
        this.itemsPerPage = page.locator('.column.main > div:nth-child(3) #toolbar-amount');
        this.productCard = {
            fullCard: page.locator('.products.list.items.product-items > li > div'),
            name: page.locator('.products.list.items.product-items > li .product.name.product-item-name > a'),
            price: page.locator('.products.list.items.product-items > li .price'),
            size: (size) => page.locator(`.products.list.items.product-items > li [aria-label="Size"] [option-label="${size}"]`),
            allSize: page.locator('.products.list.items.product-items > li [aria-label="Size"] div'),
            color: (color) => page.locator(`.products.list.items.product-items > li [aria-label="Color"] [aria-label="${color}"]`),
            allColors: page.locator('.products.list.items.product-items > li [aria-label="Color"] div'),
        };
        this.filters = {
            filterOption: (filterName) => page.locator(`.filter-options [data-role="title"]:text-is("${filterName}")`),
            colorOption: {
                selectColor: (color) => page.locator(`.filter-options > div [attribute-code="color"] a[aria-label="${color}"] > div`),
                allColors: page.locator('.filter-options > div [attribute-code="color"] a'),
            },
            sizeOption: {
                selectSize: (size) => page.locator(`.filter-options [attribute-code="size"] a[aria-label="${size}"] > div`),
                allSizes: page.locator('.filter-options [attribute-code="size"] a'),
            },
            textFilters: page.locator('.filter-options [data-role="collapsible"] > div:nth-child(2)[aria-hidden="false"] a'),
        }
        this.pagination = {
            previous: page.locator('.column.main > div:nth-child(5) ul .item.pages-item-previous a'),
            numberOfPage: (numberOfPage) => page.locator(`.column.main > div:nth-child(5) ul .item span:nth-child(2):text-is("${numberOfPage}")`),
            allPages: page.locator('.column.main > div:nth-child(5) ul [class*="item"]:not([class*="pages-item-previous"]):not([class*="pages-item-next"]) span:nth-child(2)'),
            next: page.locator('.column.main > div:nth-child(5) ul .item.pages-item-next a'),
        }
        this.productPerPageDropDown = page.locator('.column.main > div:nth-child(5) #limiter');
    }

    changeType = (arr, type) => {
        switch (type) {
            case 'number':
                arr = arr.filter(e => !(e === ''))
                arr = arr.map(e => Number(e))
                break;
            case 'string':
                arr = arr.map(e => String(e))
                break;
        }
        return arr;
    }

    isSortedAsc = (arr, type) => {
        arr = this.changeType(arr, type);
        return arr.every((element, index, array) => !index || array[index - 1] <= element);
    };

    isSortedDesc = (arr, type) => {
        arr = this.changeType(arr, type);
        return arr.every((element, index, array) => !index || array[index - 1] >= element);
    };

    async expandFilter(filterName) {
        if (await this.filters.filterOption(filterName).getAttribute('aria-expanded') === 'false')
            await this.filters.filterOption(filterName).click();
    }

    async clickColorInFilter(color) {
        await this.filters.colorOption.selectColor(color).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickSizeInFilter(size) {
        await this.filters.sizeOption.selectSize(size).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickPriceInFilter(index) {
        await this.filters.textFilters.nth(index).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickCompareProductsButton() {
        await this.compareProductsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async sortProductsBy(parameter) {
        await Promise.all([
            this.sortByDropdowm.selectOption(parameter),
            this.page.waitForResponse(resp =>
                resp.url().includes('https://magento.softwaretestingboard.com/women/tops-women.html') &&
                resp.status() === 200),
        ]);
        await this.page.waitForSelector('.products.list.items.product-items > li .price >> nth=0');
    }

    async checkPriceSort(order) {
        const prices = (await this.productCard.price.allTextContents()).map((e) => e.replace('$', ''));
        if (order === 'asc') {
            expect(this.isSortedAsc(prices, 'number')).toBe(true);
        } else {
            expect(this.isSortedDesc(prices, 'number')).toBe(true);
        }
    }

    async checkNameSort(order) {
        const name = (await this.productCard.name.allTextContents()).map((e) => e.trim());
        if (order === 'asc') {
            expect(this.isSortedAsc(name, 'string')).toBe(true);
        } else {
            expect(this.isSortedDesc(name, 'string')).toBe(true);
        }
    }

    async inputTextInSearchField(text) {
        await Promise.all([
            this.page.waitForResponse(resp =>
                resp.url().includes('https://magento.softwaretestingboard.com/search/ajax/suggest/') &&
                resp.status() === 200),
            this.search.field.fill(text),
        ]);
        await this.search.autocomplete.nth(0).click();
        await this.page.waitForSelector('.products.list.items.product-items > li .price >> nth=0');
    }

    async checkSearchField(text) {
        const productNames = (await this.productCard.name.allTextContents()).map((e) => e.trim());
        text = text.split(' ');
        productNames.map(e => {
            expect(text.some(element => e.includes(element))).toBe(true);
        });
    }

    async clickNextPageButton() {
        await Promise.all([
            this.pagination.next.click(),
            this.page.waitForResponse(resp =>
                resp.url().includes('https://magento.softwaretestingboard.com/women/tops-women.html') &&
                resp.status() === 200),
        ]);
        await this.page.waitForSelector('.products.list.items.product-items > li .price >> nth=0');
    }

    async clickOnProduct(index) {
        await this.productCard.fullCard.nth(index).click();
        await this.page.waitForLoadState('networkidle');
    }
}