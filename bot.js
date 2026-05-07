import { chromium } from 'playwright';

const BASE_URL = 'https://habitflow-theta-nine.vercel.app';

function randomDelay(min = 800, max = 1800) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHabit() {
  const habits = [
    'Workout Bot',
    'Drink Water Bot',
    'Morning Run Bot',
    'Read Book Bot',
    'Meditation Bot',
    'Study React Bot',
    'Stretching Bot',
    'Healthy Food Bot',
    'Sleep Early Bot',
    'Coding Practice Bot'
  ];

  return habits[Math.floor(Math.random() * habits.length)];
}

async function safeClick(locator, label, timeout = 5000) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    await locator.first().scrollIntoViewIfNeeded();
    await locator.first().click();
    console.log(`CLICKED: ${label}`);
    return true;
  } catch (err) {
    console.log(`SKIPPED: ${label}`);
    return false;
  }
}

async function safeFill(locator, value, label, timeout = 5000) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    await locator.first().scrollIntoViewIfNeeded();
    await locator.first().click();
    await locator.first().fill(value);
    console.log(`FILLED: ${label} -> ${value}`);
    return true;
  } catch (err) {
    console.log(`FILL FAILED: ${label}`);
    return false;
  }
}

async function openHome(page) {
  console.log('Opening site...');

  await page.goto(BASE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForSelector('button', { timeout: 15000 });
  await page.waitForTimeout(3000);

  const title = await page.title().catch(() => 'NO_TITLE');
  console.log('PAGE TITLE:', title);
  console.log('SITE OPENED');
}

async function clickThemeForSentry(page) {
  const themeBtn = page.locator('button[title="Змінити тему"]');
  const clicked = await safeClick(themeBtn, 'theme button');
  if (clicked) {
    console.log('SENTRY TEST ACTION: theme toggle clicked');
    await page.waitForTimeout(randomDelay());
  }
}

async function createHabit(page) {
  const newBtn = page.locator('button:has-text("Нова")');
  const opened = await safeClick(newBtn, 'Нова button');

  if (!opened) return false;

  await page.waitForTimeout(1200);

  const habitName = randomHabit();

  const filled = await safeFill(
    page.locator('input').first(),
    habitName,
    'habit input'
  );

  if (!filled) return false;

  await page.waitForTimeout(900);

  await safeClick(page.locator('button:has-text("Створити")'), 'Створити button');
  await page.waitForTimeout(1800);

  console.log(`HABIT CREATED: ${habitName}`);
  return true;
}

async function markHabitDone(page) {
  const markBtn = page.locator('button:has-text("Відмітити")');
  const clicked = await safeClick(markBtn, 'Відмітити button');

  if (clicked) {
    await page.waitForTimeout(randomDelay());
    console.log('HABIT MARKED DONE');
  }
}

async function openStats(page) {
  const statsBtn = page.locator('button:has-text("Статистика")');
  const clicked = await safeClick(statsBtn, 'Статистика button');

  if (clicked) {
    await page.waitForTimeout(2200);
    console.log('STATS OPENED');
  }
}

async function applyFilters(page) {
  const filters = ['Залишилось', 'Виконані', 'Стрік 2+', 'Всі'];

  for (const filter of filters) {
    const btn = page.locator(`button:has-text("${filter}")`);
    const clicked = await safeClick(btn, `filter ${filter}`, 2500);

    if (clicked) {
      await page.waitForTimeout(900);
      console.log(`FILTER APPLIED: ${filter}`);
    }
  }
}

async function openSettingsAndSave(page) {
  const settingsBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(3);

  try {
    await settingsBtn.waitFor({ state: 'visible', timeout: 4000 });
    await settingsBtn.click();
    console.log('SETTINGS OPENED');
    await page.waitForTimeout(1500);
  } catch {
    console.log('SETTINGS BUTTON NOT FOUND');
    return;
  }

  const plusButton = page.locator('button').filter({ hasText: '+' }).first();
  try {
    await plusButton.waitFor({ state: 'visible', timeout: 2500 });
    await plusButton.click();
    console.log('DAILY GOAL INCREASED');
    await page.waitForTimeout(800);
  } catch {
    console.log('PLUS BUTTON NOT FOUND IN SETTINGS');
  }

  await safeClick(page.locator('button:has-text("Зберегти")'), 'Зберегти settings');
  await page.waitForTimeout(1500);
}

async function deleteHabit(page) {
  const trashButtons = page.locator('button');

  const count = await trashButtons.count().catch(() => 0);
  if (!count) {
    console.log('NO BUTTONS FOUND FOR DELETE STEP');
    return;
  }

  let deleted = false;

  for (let i = 0; i < count; i++) {
    try {
      const btn = trashButtons.nth(i);
      const box = await btn.boundingBox();
      if (!box) continue;

      const text = await btn.textContent().catch(() => '');
      if (text && text.trim()) continue;

      await btn.click({ timeout: 1000 });
      await page.waitForTimeout(1200);

      const confirmBtn = page.locator('button:has-text("Видалити")').last();
      if (await confirmBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await confirmBtn.click();
        console.log('HABIT DELETED');
        deleted = true;
        await page.waitForTimeout(1800);
        break;
      }
    } catch (_) {}
  }

  if (!deleted) {
    console.log('DELETE STEP SKIPPED');
  }
}

async function backHome(page) {
  const homeBtn = page.locator('button:has-text("Головна")');
  const clicked = await safeClick(homeBtn, 'Головна button');

  if (clicked) {
    await page.waitForTimeout(1200);
    console.log('BACK TO HOME');
  }
}

async function simulateCycle(page, cycle) {
  console.log(`\n========== CYCLE ${cycle} START ==========`);

  await clickThemeForSentry(page);
  await createHabit(page);
  await markHabitDone(page);
  await openStats(page);
  await applyFilters(page);
  await backHome(page);
  await openSettingsAndSave(page);
  await deleteHabit(page);
  await backHome(page);

  console.log(`========== CYCLE ${cycle} END ==========\n`);
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: {
      width: 1440,
      height: 900
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('habitflow-theta-nine.vercel.app')) {
      console.log('RESPONSE:', response.status(), url);
    }
  });

  try {
    await openHome(page);

    let cycle = 1;
    while (true) {
      await simulateCycle(page, cycle);
      cycle += 1;
      await page.waitForTimeout(randomDelay(2500, 5000));
    }
  } catch (err) {
    console.error('BOT ERROR:', err);
    await page.pause();
  }
})();