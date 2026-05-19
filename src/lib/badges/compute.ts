export interface CollectorBadge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface CollectorStats {
  totalSpent: number
  totalModels: number
  uniqueBrands: number
  ordersCount: number
  hasTreasureHunt: boolean
  uniqueScalesCount: number
}

export function computeBadges(stats: CollectorStats): CollectorBadge[] {
  const badges: CollectorBadge[] = [
    {
      id: 'first-purchase',
      name: 'First Lap',
      description: 'Completed your first order on Diecast Corner Nepal.',
      icon: '🏁',
      unlocked: stats.ordersCount >= 1,
    },
    {
      id: 'ten-orders',
      name: 'Super Collector',
      description: 'Placed 10 or more orders.',
      icon: '🏆',
      unlocked: stats.ordersCount >= 10,
    },
    {
      id: 'treasure-hunter',
      name: 'Treasure Hunter',
      description: 'Acquired a rare Treasure Hunt model.',
      icon: '⭐',
      unlocked: stats.hasTreasureHunt,
    },
    {
      id: 'collector-elite',
      name: 'Garage Elite',
      description: 'Spent over Rs. 50,000 in official purchases.',
      icon: '💎',
      unlocked: stats.totalSpent > 50000,
    },
    {
      id: 'scale-master',
      name: 'Scale Master',
      description: 'Collected models of multiple different scales.',
      icon: '📏',
      unlocked: stats.uniqueScalesCount >= 2,
    },
  ]

  return badges
}
