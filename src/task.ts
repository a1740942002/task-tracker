import fs from 'fs'
import { Task } from './type'
import { TASKS_FILE } from './config'

export async function createTask(tasks: Task[], description: string) {
  const now = new Date().toISOString()
  const newTask: Task = {
    id: getNextId(tasks),
    description,
    status: 'todo',
    createdAt: now,
    updatedAt: now
  }
  return newTask
}

export async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.promises.readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data) as Task[]
  } catch (error) {
    return []
  }
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.promises.writeFile(
    TASKS_FILE,
    JSON.stringify(tasks, null, 2),
    'utf-8'
  )
}

export function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1
  const maxId = tasks.reduce((max, task) => (task.id > max ? task.id : max), 0)
  return maxId + 1
}
