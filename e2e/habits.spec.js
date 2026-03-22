import { test, expect } from '@playwright/test'

test.describe('HabitFlow — основний функціонал', () => {

  test('головна сторінка відкривається і показує заголовок', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('span:has-text("HabitFlow")').first()).toBeVisible()
  })

  test('додавання нової звички', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Нова")')
    await page.fill('input[placeholder="Наприклад: Читати 30 хвилин"]', 'Тестова звичка')
    await page.click('button:has-text("Створити")')
    await expect(page.locator('text=Тестова звичка')).toBeVisible()
  })

})
