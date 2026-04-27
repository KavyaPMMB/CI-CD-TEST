import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import "chromedriver";

async function run() {
  const options = new chrome.Options()
    .addArguments("--headless=new", "--disable-gpu", "--window-size=1440,900");

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  const email = process.env.E2E_EMAIL || "kavyapmmb1@gmail.com";
  const password = process.env.E2E_PASSWORD || "Kavya@123";
  const runId = Date.now();
  const fallbackRegisterEmail = `e2e_${runId}@example.com`;
  const taskOne = `E2E task one ${runId}`;
  const taskTwo = `E2E task two ${runId}`;

  try {
    const safeClick = async (element) => {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
      try {
        await element.click();
      } catch {
        await driver.executeScript("arguments[0].click();", element);
      }
    };

    await driver.get("http://localhost:5173");
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
    await driver.navigate().refresh();
    // Login-only flow: test uses a pre-created account.
    const maybeToggle = await driver.findElements(By.css('[data-testid="auth-toggle-button"]'));
    if (maybeToggle.length > 0) {
      const toggleText = await maybeToggle[0].getText();
      if (toggleText.toLowerCase().includes("already have")) {
        await safeClick(maybeToggle[0]);
      }
    }

    await driver.wait(until.elementLocated(By.css('[data-testid="auth-email-input"]')), 15000);
    const tryLogin = async (userEmail) => {
      const emailInput = await driver.findElement(By.css('[data-testid="auth-email-input"]'));
      await emailInput.clear();
      await emailInput.sendKeys(userEmail);
      const passwordInput = await driver.findElement(By.css('[data-testid="auth-password-input"]'));
      await passwordInput.clear();
      await passwordInput.sendKeys(password, Key.TAB);
      const submitBtn = await driver.findElement(By.css('[data-testid="auth-submit-button"]'));
      await safeClick(submitBtn);
    };

    await tryLogin(email);

    let authenticated = false;
    try {
      await driver.wait(until.elementLocated(By.css('[data-testid="todo-input"]')), 8000);
      authenticated = true;
    } catch {
      authenticated = false;
    }

    if (!authenticated) {
      // CI/local fallback: create a fresh backend-auth user when login credentials do not exist.
      const toggleBtn = await driver.findElement(By.css('[data-testid="auth-toggle-button"]'));
      const toggleText = await toggleBtn.getText();
      if (!toggleText.toLowerCase().includes("already have")) {
        await safeClick(toggleBtn);
      }

      const nameInput = await driver.findElement(By.css('[data-testid="auth-name-input"]'));
      await nameInput.clear();
      await nameInput.sendKeys("E2E User");
      const registerEmailInput = await driver.findElement(By.css('[data-testid="auth-email-input"]'));
      await registerEmailInput.clear();
      await registerEmailInput.sendKeys(fallbackRegisterEmail);
      const registerPasswordInput = await driver.findElement(By.css('[data-testid="auth-password-input"]'));
      await registerPasswordInput.clear();
      await registerPasswordInput.sendKeys(password, Key.TAB);
      const registerSubmitBtn = await driver.findElement(By.css('[data-testid="auth-submit-button"]'));
      await safeClick(registerSubmitBtn);
      await driver.wait(until.elementLocated(By.css('[data-testid="todo-input"]')), 25000);
    }

    // Ensure deterministic starting context.
    const allFilterBtn = await driver.findElement(By.xpath("//button[.//span[contains(.,'All')]]"));
    await safeClick(allFilterBtn);

    const addTask = async (title) => {
      const taskXPath = By.xpath(`//*[contains(text(),'${title}')]`);
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const input = await driver.findElement(By.css('[data-testid="todo-input"]'));
        await input.clear();
        await input.sendKeys(title);

        const addButton = await driver.findElement(By.css('[data-testid="add-todo-button"]'));
        await driver.executeScript("arguments[0].click();", addButton);
        await input.sendKeys(Key.ENTER);

        try {
          await driver.wait(until.elementLocated(taskXPath), 12000);
          return;
        } catch {
          if (attempt === 3) {
            const pageText = await driver.findElement(By.tagName("body")).getText();
            throw new Error(
              `Task "${title}" was not added after retries. Page snapshot:\n${pageText.slice(0, 1200)}`
            );
          }
        }
      }
    };

    await addTask(taskOne);
    await addTask(taskTwo);

    // Mark the specific task complete using its own row action.
    const taskOneRowToggle = await driver.findElement(
      By.xpath(
        `//*[contains(text(),'${taskOne}')]/ancestor::*[@role='listitem'][1]//button[contains(@aria-label,'Mark')]`
      )
    );
    await safeClick(taskOneRowToggle);

    // Open "Completed" filter and verify completed task is visible there.
    const completedFilterBtn = await driver.findElement(
      By.xpath("//button[.//span[contains(.,'Completed')]]")
    );
    await safeClick(completedFilterBtn);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${taskOne}')]`)), 15000);

    // Switch to "Pending" and ensure second task remains visible.
    const pendingFilterBtn = await driver.findElement(By.xpath("//button[.//span[contains(.,'Pending')]]"));
    await safeClick(pendingFilterBtn);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${taskTwo}')]`)), 15000);

    // Back to all tasks and delete one task.
    const allFilterBtnAgain = await driver.findElement(By.xpath("//button[.//span[contains(.,'All')]]"));
    await safeClick(allFilterBtnAgain);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${taskTwo}')]`)), 15000);
    const deleteButtons = await driver.findElements(By.css('button[aria-label="Delete"]'));
    if (deleteButtons.length === 0) {
      throw new Error("Could not find delete button for task cleanup");
    }
    await safeClick(deleteButtons[0]);

    // Confirm at least one e2e task still exists after delete action.
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${taskOne}')]`)), 20000);

    const logoutButton = await driver.findElement(By.css('[data-testid="logout-button"]'));
    await safeClick(logoutButton);
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
