import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const validUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!'
  };

  test('Successful registration and login', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[formControlName="email"]', validUser.email);
    await page.fill('input[formControlName="password"]', validUser.password);
    await page.fill('input[formControlName="confirmPassword"]', validUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');
    await page.goto('/login');
    await page.fill('input[formControlName="email"]', validUser.email);
    await page.fill('input[formControlName="password"]', validUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/products');
  });

  test('Registration fails with mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[formControlName="email"]', validUser.email);
    await page.fill('input[formControlName="password"]', 'Test123!');
    await page.fill('input[formControlName="confirmPassword"]', 'Different123!');
    await page.click('h2');
    await expect(page.locator('.error-message')).toContainText('Passwords do not match');

  });

  test('Registration fails with invalid email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[formControlName="email"]', 'invalid-email');
    await page.fill('input[formControlName="password"]', 'Test123!');
    await page.fill('input[formControlName="confirmPassword"]', 'Test123!');
    // await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('Please enter a valid email');
  });

  test('Registration fails with empty fields', async ({ page }) => {
    await page.goto('/register');
    const addButtons = await page.$$('.add-btn');
    await expect(addButtons.length).toBe(0);
  });

  test('Login fails with incorrect password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formControlName="email"]', validUser.email);
    await page.fill('input[formControlName="password"]', 'WrongPass!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('Invalid email or password');
  });

  test('Login fails with non-existing user', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formControlName="email"]', 'nouser@example.com');
    await page.fill('input[formControlName="password"]', 'Whatever123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('Invalid email or password');
  });
});

test.describe('Shopping Cart Flow', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    name: 'Test User'
  };

  test('Complete shopping flow', async ({ page }) => {
    // Registration
    await page.goto('/register');
    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="password"]', testUser.password);
    await page.fill('input[formControlName="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');

    // Login
    await page.goto('/login');
    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/products');

    // Add items to cart
    await page.waitForSelector('.product-card');
    const addButtons = await page.$$('.add-btn');

    if (addButtons.length >= 2) {
      await addButtons[0].click();
      await addButtons[1].click();
    } else {
      throw new Error(`Not enough products to test cart flow. Found ${addButtons.length}`);
    }

    // Verify cart counter
    await expect(page.locator('span:has-text("items in cart")')).toHaveText('2 items in cart');

    // View cart
    await page.click('a:has-text("Cart")');
    await expect(page).toHaveURL('/cart');

    // Verify cart items
    await expect(page.locator('.product-card')).toHaveCount(2);

    // Verify total price
    const totalPrice = await page.textContent('.product-sum');
    expect(totalPrice).toContain('$');

    // Remove item from cart
    await page.locator('.remove-btn').first().click();

    // Verify updated cart count
    await expect(page.locator('span:has-text("items in cart")')).toHaveText('1 items in cart');

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
  });
});
