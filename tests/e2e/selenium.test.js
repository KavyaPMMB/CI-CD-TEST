import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import "chromedriver";

async function run() {
  const options = new chrome.Options()
    .addArguments("--headless=new", "--disable-gpu", "--window-size=1440,900");

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  const email = `selenium_${Date.now()}@example.com`;

  try {
    await driver.get("http://localhost:5173");

    const toggleBtn = await driver.wait(
      until.elementLocated(By.css('[data-testid="auth-toggle-button"]')),
      15000
    );
    await toggleBtn.click();

    await driver.findElement(By.css('[data-testid="auth-name-input"]')).sendKeys("Selenium User");
    await driver.findElement(By.css('[data-testid="auth-email-input"]')).sendKeys(email);
    await driver
      .findElement(By.css('[data-testid="auth-password-input"]'))
      .sendKeys("secret123", Key.TAB);

    await driver.findElement(By.css('[data-testid="auth-submit-button"]')).click();
    let todoReady = false;
    try {
      await driver.wait(until.elementLocated(By.css('[data-testid="todo-input"]')), 8000);
      todoReady = true;
    } catch {
      // Some auth providers create account without immediate sign-in.
      // Fallback: try logging in with the same credentials.
      const maybeToggle = await driver.findElements(By.css('[data-testid="auth-toggle-button"]'));
      if (maybeToggle.length > 0) {
        const toggleText = await maybeToggle[0].getText();
        if (toggleText.toLowerCase().includes("already have")) {
          await maybeToggle[0].click();
        }
      }
      const emailInput = await driver.findElement(By.css('[data-testid="auth-email-input"]'));
      await emailInput.clear();
      await emailInput.sendKeys(email);
      const passwordInput = await driver.findElement(By.css('[data-testid="auth-password-input"]'));
      await passwordInput.clear();
      await passwordInput.sendKeys("secret123");
      await driver.findElement(By.css('[data-testid="auth-submit-button"]')).click();
      await driver.wait(until.elementLocated(By.css('[data-testid="todo-input"]')), 25000);
      todoReady = true;
    }

    if (!todoReady) {
      throw new Error("Could not reach todo screen after signup/login");
    }
    const todoInput = await driver.findElement(By.css('[data-testid="todo-input"]'));
    await todoInput.sendKeys("E2E task");
    await driver.findElement(By.css('[data-testid="add-todo-button"]')).click();

    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'E2E task')]")), 20000);

    await driver.findElement(By.css('[data-testid="logout-button"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-testid="auth-submit-button"]')), 10000);

    console.log("Selenium E2E passed");
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error("Selenium E2E failed:", err);
  process.exit(1);
});
