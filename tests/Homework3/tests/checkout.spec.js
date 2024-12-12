import {expect, test} from "@playwright/test";
import {ProductListPage} from "../pages/productList.page";
import {ProductDetailsPage} from "../pages/productDetails.page";
import {CommonPage} from "../pages/common.page";
import {CheckoutPage} from "../pages/checkout.page";
import {faker} from "@faker-js/faker";

let page;
let productListPage;
test.beforeEach(async ({browser}) => {
    const context = await browser.newContext({viewport: {height: 900, width: 1600}});
    page = await context.newPage();
    await page.route(/(\/js\/adsbygoogle\.js)|(adtrafficquality.google\/pagead)|(www.google-analytics\.com)/, (route) => route.abort());
    productListPage = new ProductListPage(page);
    await page.goto('https://magento.softwaretestingboard.com/women/tops-women.html');
    await page.waitForLoadState('networkidle');
});

test('Verify users can view detailed product descriptions, images, and specifications', async () => {
    await productListPage.clickOnProduct(0);
    const productDetailsPage = new ProductDetailsPage(page);

    await expect(productDetailsPage.detailsTab.text).toBeVisible();
    await productDetailsPage.clickOnMoreInfoTab();
    await expect(productDetailsPage.moreInfoTab.style).toBeVisible();
    await expect(productDetailsPage.moreInfoTab.material).toBeVisible();
    await expect(productDetailsPage.moreInfoTab.pattern).toBeVisible();
    await expect(productDetailsPage.moreInfoTab.climate).toBeVisible();

    await expect(productDetailsPage.productInfoMain.size.nth(0)).toBeVisible();

    await expect(productDetailsPage.productInfoMain.color.nth(0)).toBeVisible();
});

test('Verify users can complete the checkout process with valid details', async () => {
    await productListPage.clickOnProduct(0);

    const productDetailsPage = new ProductDetailsPage(page);
    const commonPage = new CommonPage(page);
    const checkoutPage = new CheckoutPage(page);

    await productDetailsPage.productInfoMain.size.nth(0).click();
    await productDetailsPage.productInfoMain.color.nth(0).click();

    await productDetailsPage.clickOnAddToCardButton();
    await commonPage.cart.button.click();
    await commonPage.clickOnProceedToCheckoutButton();

    const shippingAddress = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        streetAddress: faker.location.streetAddress(),
        city: faker.location.city(),
        state: 'Illinois',
        zip: faker.location.zipCode(),
        phoneNumber: faker.phone.number({style: 'international'}),
    };

    await checkoutPage.fillShippingAddress(shippingAddress);
    await checkoutPage.clickNextButton();
    await checkoutPage.clickPlaceOrderButton();
});