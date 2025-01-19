#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { program } from 'commander'

/**
 * 定義 Task 物件的結構
 */
interface Task {
  id: number
  description: string
  status: 'todo' | 'in-progress' | 'done'
  createdAt: string
  updatedAt: string
}

// 指定 tasks.json 的位置（放在同層目錄）
const TASKS_FILE = path.join(__dirname, '../data/tasks.json')

// 讀取檔案，若不存在就回傳空陣列
async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.promises.readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data) as Task[]
  } catch (error) {
    // 檔案不存在或格式錯誤時，回傳空陣列
    return []
  }
}

// 寫入到 tasks.json
async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.promises.writeFile(
    TASKS_FILE,
    JSON.stringify(tasks, null, 2),
    'utf-8'
  )
}

// 取得下一個任務 ID
function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1
  const maxId = tasks.reduce((max, task) => (task.id > max ? task.id : max), 0)
  return maxId + 1
}

/**
 * 新增任務：task-cli add "Buy groceries"
 */
program
  .command('add <description...>')
  .description('Add a new task')
  .action(async (descriptionParts: string[]) => {
    const description = descriptionParts.join(' ')
    const tasks = await readTasks()
    const now = new Date().toISOString()

    const newTask: Task = {
      id: getNextId(tasks),
      description,
      status: 'todo',
      createdAt: now,
      updatedAt: now
    }

    tasks.push(newTask)
    await writeTasks(tasks)

    console.log(`Task added successfully (ID: ${newTask.id})`)
  })

/**
 * 更新任務內容：task-cli update 1 "Buy groceries and cook dinner"
 */
program
  .command('update <id> <description...>')
  .description('Update a task')
  .action(async (id: string, descriptionParts: string[]) => {
    const newDescription = descriptionParts.join(' ')
    const tasks = await readTasks()
    const taskIndex = tasks.findIndex((t) => t.id === parseInt(id, 10))

    if (taskIndex === -1) {
      console.log(`Task with ID ${id} not found.`)
      return
    }

    tasks[taskIndex].description = newDescription
    tasks[taskIndex].updatedAt = new Date().toISOString()

    await writeTasks(tasks)
    console.log(`Task updated successfully (ID: ${id})`)
  })

/**
 * 刪除任務：task-cli delete 1
 */
program
  .command('delete <id>')
  .description('Delete a task')
  .action(async (id: string) => {
    let tasks = await readTasks()
    const oldLength = tasks.length
    tasks = tasks.filter((t) => t.id !== parseInt(id, 10))

    if (tasks.length === oldLength) {
      console.log(`Task with ID ${id} not found.`)
      return
    }

    await writeTasks(tasks)
    console.log(`Task (ID: ${id}) deleted successfully.`)
  })

/**
 * 標記為 in-progress：task-cli mark-in-progress 1
 */
program
  .command('mark-in-progress <id>')
  .description('Mark a task as in-progress')
  .action(async (id: string) => {
    const tasks = await readTasks()
    const task = tasks.find((t) => t.id === parseInt(id, 10))

    if (!task) {
      console.log(`Task with ID ${id} not found.`)
      return
    }

    task.status = 'in-progress'
    task.updatedAt = new Date().toISOString()
    await writeTasks(tasks)

    console.log(`Task (ID: ${id}) is now in-progress.`)
  })

/**
 * 標記為 done：task-cli mark-done 1
 */
program
  .command('mark-done <id>')
  .description('Mark a task as done')
  .action(async (id: string) => {
    const tasks = await readTasks()
    const task = tasks.find((t) => t.id === parseInt(id, 10))

    if (!task) {
      console.log(`Task with ID ${id} not found.`)
      return
    }

    task.status = 'done'
    task.updatedAt = new Date().toISOString()
    await writeTasks(tasks)

    console.log(`Task (ID: ${id}) is now done.`)
  })

/**
 * 列出任務：task-cli list
 * 列出指定狀態：task-cli list done / todo / in-progress
 */
program
  .command('list [status]')
  .description('List tasks (optionally by status: todo, in-progress, done)')
  .action(async (status: string | undefined) => {
    const tasks = await readTasks()

    let filteredTasks: Task[]
    if (!status) {
      filteredTasks = tasks
    } else {
      filteredTasks = tasks.filter((t) => t.status === status)
    }

    if (filteredTasks.length === 0) {
      console.log('No tasks found.')
      return
    }

    console.log(
      'ID | Status       | Created At           | Updated At           | Description'
    )
    console.log(
      '---|--------------|-----------------------|-----------------------|-------------------------------'
    )

    filteredTasks.forEach((t) => {
      console.log(
        `${String(t.id).padEnd(2)} | ${t.status.padEnd(
          12
        )} | ${t.createdAt.padEnd(21)} | ${t.updatedAt.padEnd(21)} | ${
          t.description
        }`
      )
    })
  })

// 解析命令列參數
program.parse(process.argv)
