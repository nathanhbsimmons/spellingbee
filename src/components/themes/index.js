import Garden from './Garden'
import Space from './Space'
import Treasure from './Treasure'
import Aquarium from './Aquarium'

export const THEMES = {
  garden: { name: 'Garden', emoji: '🌸', component: Garden },
  space: { name: 'Space', emoji: '🚀', component: Space },
  treasure: { name: 'Treasure', emoji: '💎', component: Treasure },
  aquarium: { name: 'Aquarium', emoji: '🐠', component: Aquarium },
}

export const DEFAULT_THEME = 'garden'
