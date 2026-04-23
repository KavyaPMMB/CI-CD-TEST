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

    await driver.wait(until.elementLocated(By.css('[data-testid="todo-input"]')), 20000);
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
