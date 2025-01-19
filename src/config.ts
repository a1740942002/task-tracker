import { Command } from 'commander'
import path from 'path'

export const program = new Command()
export const TASKS_FILE = path.join(__dirname, '../data/tasks.json')
