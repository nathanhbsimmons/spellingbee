import Garden from './Garden'
import Space from './Space'
import Treasure from './Treasure'
import Aquarium from './Aquarium'

export const THEMES = {
  garden: { name: 'Garden', emoji: '🌸', component: Garden, doneLabel: 'bloomed', todoLabel: 'to tend', allDoneText: 'All flowers bloomed!' },
  space: { name: 'Space', emoji: '🚀', component: Space, doneLabel: 'launched', todoLabel: 'to launch', allDoneText: 'All stars launched!' },
  treasure: { name: 'Treasure', emoji: '💎', component: Treasure, doneLabel: 'collected', todoLabel: 'to find', allDoneText: 'All treasure collected!' },
  aquarium: { name: 'Aquarium', emoji: '🐠', component: Aquarium, doneLabel: 'caught', todoLabel: 'to catch', allDoneText: 'All fish caught!' },
}

export const DEFAULT_THEME = 'garden'
