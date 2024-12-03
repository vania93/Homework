import {expect, test} from "@playwright/test";
import {ProductListPage} from "../pages/productList.page";
import {ProductDetailsPage} from "../pages/productDetails.page";
import {CompareProductsPage} from "../pages/compareProducts.page";

let context;
let page;
let productListPage;
test.beforeEach(async ({browser}) => {
    context = await browser.newContext({viewport: {height: 900, width: 1600}});
    page = await context.newPage();
    await page.route(/(\/js\/adsbygoogle\.js)|(adtrafficquality.google\/pagead)|(www.google-analytics\.com)/, (route) => route.abort());
    productListPage = new ProductListPage(page);
    await page.goto('https://magento.softwaretestingboard.com/women/tops-women.html');
    await page.waitForLoadState('networkidle');
});
test('Verify users can filter products by color', async () => {
    await productListPage.expandFilter('Color');

    let randomColor;
    await test.step('Select random color in filter and click it', async () => {
        let allColors = []
        for (let i = 0; i < await productListPage.filters.colorOption.allColors.count(); i++) {
            allColors.push(await productListPage.filters.colorOption.allColors.nth(i).getAttribute('aria-label'))
        }
        randomColor = allColors[Math.floor(Math.random() * allColors.length)];
        await productListPage.clickColorInFilter(randomColor);
    });

    const countOfProducts = await productListPage.productCard.fullCard.count();
    let countOfSelectedFilters = 0;
    await test.step('Check if all product have selected color', async () => {
        for (let i = 0; i < await productListPage.productCard.allColors.count(); i++) {
            if (await productListPage.productCard.allColors.nth(i).getAttribute('aria-checked') === 'true'
                && await productListPage.productCard.allColors.nth(i).getAttribute('option-label') === randomColor) {
                countOfSelectedFilters++;
            }
        }
        expect(countOfProducts).toBe(countOfSelectedFilters);
    });
});

test('Verify users can filter products by price', async () => {
    await productListPage.expandFilter('Price');

    let randomPrice = await productListPage.filters.textFilters.allTextContents();
    let randomPriceIndex = Math.floor(Math.random() * randomPrice.length);
    randomPrice = randomPrice[randomPriceIndex].match(/\d+.\d+/g);

    await productListPage.clickPriceInFilter(randomPriceIndex);

    const priceForAllProducts = (await productListPage.productCard.price.allTextContents()).map((e) => e.replace('$', ''));

    await test.step('Check if all product have selected price', async () => {
        if (randomPrice.length === 2)
            priceForAllProducts.map((e) => {
                expect(Number(e)).toBeGreaterThanOrEqual(Number(randomPrice[0]));
                expect(Number(e)).toBeLessThanOrEqual(Number(randomPrice[1]));
            });
        else
            priceForAllProducts.map((e) => expect(Number(e)).toBeGreaterThanOrEqual(Number(randomPrice[0])));
    });
});

test('Verify users can filter products by size', async () => {
    await productListPage.expandFilter('Size');

    let randomSize;
    await test.step('Select random size in filter and click it', async () => {
        let allSizes = []
        for (let i = 0; i < await productListPage.filters.sizeOption.allSizes.count(); i++) {
            allSizes.push(await productListPage.filters.sizeOption.allSizes.nth(i).getAttribute('aria-label'))
        }
        randomSize = allSizes[Math.floor(Math.random() * allSizes.length)];
        await productListPage.clickSizeInFilter(randomSize);
    });

    const countOfProducts = await productListPage.productCard.fullCard.count();
    let countOfSelectedFilters = 0;
    await test.step('Check if all product have selected size', async () => {
        for (let i = 0; i < await productListPage.productCard.allSize.count(); i++) {
            if (await productListPage.productCard.allSize.nth(i).getAttribute('aria-checked') === 'true'
                && await productListPage.productCard.allSize.nth(i).getAttribute('option-label') === randomSize) {
                countOfSelectedFilters++;
            }
        }
        expect(countOfProducts).toBe(countOfSelectedFilters);
    });
});

test('Verify users can filter products by climate', async () => {
    await productListPage.expandFilter('Climate');

    let randomClimate = await productListPage.filters.textFilters.allTextContents();
    let randomClimateIndex = Math.floor(Math.random() * randomClimate.length);
    randomClimate = randomClimate[randomClimateIndex].trim();

    await productListPage.clickPriceInFilter(randomClimateIndex);
    const countOfProducts = await productListPage.productCard.fullCard.count();
    await test.step('Check if all product have selected climate', async () => {
        for (let i = 0; i < countOfProducts; i++) {
            const [newPage] = await Promise.all([
                page.context().waitForEvent("page"),
                await productListPage.productCard.fullCard.nth(i).click({button: 'middle'}),
            ]);
            const productDetailsPage = new ProductDetailsPage(newPage);
            await productDetailsPage.clickOnMoreInfoTab();
            await expect(productDetailsPage.moreInfoTab.climate).toContainText(randomClimate.replace(/\d.*\n.*/, '').trim())
            await newPage.close();
        }
    });
});

test('Verify users can filter products by material', async () => {
    await productListPage.expandFilter('Material');

    let randomMaterial = await productListPage.filters.textFilters.allTextContents();
    let randomMaterialIndex = Math.floor(Math.random() * randomMaterial.length);
    randomMaterial = randomMaterial[randomMaterialIndex].trim();

    await productListPage.clickPriceInFilter(randomMaterialIndex);
    const countOfProducts = await productListPage.productCard.fullCard.count();
    await test.step('Check if all product have selected material', async () => {
        for (let i = 0; i < countOfProducts; i++) {
            const [newPage] = await Promise.all([
                page.context().waitForEvent("page"),
                await productListPage.productCard.fullCard.nth(i).click({button: 'middle'}),
            ]);
            const productDetailsPage = new ProductDetailsPage(newPage);
            await productDetailsPage.clickOnMoreInfoTab();
            await expect(productDetailsPage.moreInfoTab.material).toContainText(randomMaterial.replace(/\d.*\n.*/, '').trim())
            await newPage.close();
        }
    });
});

test('Verify users can compare 2 items', async () => {
    let productsData = [];
    await test.step('Open 2 products and get data', async () => {
        for (let i = 0; i < 2; i++) {
            const [newPage] = await Promise.all([
                page.context().waitForEvent("page"),
                await productListPage.productCard.fullCard.nth(i).click({button: 'middle'}),
            ]);
            await newPage.route(/(\/js\/adsbygoogle\.js)|(adtrafficquality.google\/pagead)/, (route) => route.abort());
            await newPage.waitForLoadState('networkidle');
            const productDetailsPage = new ProductDetailsPage(newPage);
            productsData.push(await productDetailsPage.getProductData());
            await productDetailsPage.clickOnAddToCompareButton();
            await newPage.close();
        }
    });

    await page.reload();
    await productListPage.clickCompareProductsButton();
    const compareProductsPage = new CompareProductsPage(page);
    await compareProductsPage.compareProductDataWith(productsData);
});

test('Verify users can sort products by price', async () => {
    await productListPage.sortProductsBy('price');
    await productListPage.checkPriceSort('asc');
});

test('Verify users can sort products by product name', async () => {
    await productListPage.sortProductsBy('name');
    await productListPage.checkNameSort('asc');
});

test('Verify search functionality returns relevant results for keywords', async () => {
    let randomTitle = await productListPage.productCard.name.allTextContents();
    randomTitle = randomTitle[Math.floor(Math.random() * randomTitle.length)].trim();

    await productListPage.inputTextInSearchField(randomTitle);
    await productListPage.checkSearchField(randomTitle);
});

test('Verify pagination works correctly for product listing pages', async () => {
    const productsPerPage = Number(await productListPage.productPerPageDropDown.inputValue());
    let itemsFrom = Number((await productListPage.itemsPerPage.textContent()).trim().match(/\d+/g)[0]);
    let itemsTo = Number((await productListPage.itemsPerPage.textContent()).trim().match(/\d+/g)[1]);
    let itemsTotal = Number((await productListPage.itemsPerPage.textContent()).trim().match(/\d+/g)[2]);

    await test.step('Check if item data on first page is correct', async () => {
        expect(itemsFrom).toBe(1);
        expect(itemsTo).toBe(productsPerPage);
    });

    await test.step('Click on next button and check if item data on page is correct', async () => {
        for (let i = 1; i < await productListPage.pagination.allPages.count(); i++) {
            await productListPage.clickNextPageButton();

            itemsFrom = Number((await productListPage.itemsPerPage.textContent()).trim().match(/\d+/g)[0]);
            itemsTo = Number((await productListPage.itemsPerPage.textContent()).trim().match(/\d+/g)[1]);

            expect(itemsFrom).toBe(1 + (productsPerPage * i));
            if (itemsTo < itemsTotal)
                expect(itemsTo).toBe(productsPerPage + (productsPerPage * i));
            else
                expect(itemsTo).toBe(itemsTotal);
        }
    });
    await expect(productListPage.pagination.next).not.toBeVisible();
});