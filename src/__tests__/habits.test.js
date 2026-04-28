import { describe, it, expect } from 'vitest'
import { formatDate, calculateStreak, TODAY } from '../habitUtils.js'

describe('formatDate', () => {
  it('повертає сьогоднішню дату при offset=0', () => {
    expect(formatDate(0)).toBe(TODAY)
  })

  it('повертає вчорашню дату при offset=1', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDate(1)).toBe(yesterday.toISOString().split('T')[0])
  })

  it('повертає дату у форматі YYYY-MM-DD', () => {
    expect(formatDate(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('calculateStreak', () => {
  it('повертає 0 якщо немає виконань', () => {
    expect(calculateStreak({})).toBe(0)
  })

  it('повертає 1 якщо виконано тільки сьогодні', () => {
    expect(calculateStreak({ [TODAY]: true })).toBe(1)
  })

  it('повертає 0 якщо виконано вчора але не сьогодні', () => {
    const yesterday = formatDate(1)
    expect(calculateStreak({ [yesterday]: true })).toBe(0)
  })

  it('рахує стрік 3 дні поспіль', () => {
    const completions = {
      [formatDate(0)]: true,
      [formatDate(1)]: true,
      [formatDate(2)]: true,
    }
    expect(calculateStreak(completions)).toBe(3)
  })

  it('зупиняє стрік якщо є пропуск', () => {
    const completions = {
      [formatDate(0)]: true,
      [formatDate(2)]: true,
    }
    expect(calculateStreak(completions)).toBe(1)
  })
})

describe('логіка фільтрації звичок', () => {
  const habits = [
    { id: 1, name: 'Біг', completions: { [TODAY]: true } },
    { id: 2, name: 'Читання', completions: {} },
    { id: 3, name: 'Вода', completions: { [TODAY]: true } },
  ]

  it('фільтр "all" повертає всі звички', () => {
    const filtered = habits.filter(() => true)
    expect(filtered).toHaveLength(3)
  })

  it('фільтр "done" повертає тільки виконані сьогодні', () => {
    const filtered = habits.filter(h => !!h.completions[TODAY])
    expect(filtered).toHaveLength(2)
  })

  it('фільтр "pending" повертає невиконані сьогодні', () => {
    const filtered = habits.filter(h => !h.completions[TODAY])
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Читання')
  })
})
