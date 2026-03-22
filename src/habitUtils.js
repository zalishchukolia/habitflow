export function formatDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().split('T')[0]
}

export function calculateStreak(completions) {
  let streak = 0
  for (let i = 0; i <= 90; i++) {
    if (completions[formatDate(i)]) streak++
    else break
  }
  return streak
}

export const TODAY = new Date().toISOString().split('T')[0]
