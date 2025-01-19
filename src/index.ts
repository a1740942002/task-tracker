#!/usr/bin/env node

import { program } from './config'
import { readTasks, writeTasks, createTask } from './task'
import { Task } from './type'

program.name('task-cli').description('CLI to manage tasks').version('1.0.0')

program
  .command('add <description...>')
  .description('Add a new task')
  .action(async (descriptionParts: string[]) => {
    const description = descriptionParts.join(' ')
    const tasks = await readTasks()

    const newTask = await createTask(tasks, description)

    tasks.push(newTask)
    await writeTasks(tasks)

    console.log(`Task added successfully (ID: ${newTask.id})`)
  })

/**
 * Update task content: task-cli update 1 "Buy groceries and cook dinner"
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
 * Delete task: task-cli delete 1
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
 * Mark as in-progress: task-cli mark-in-progress 1
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
 * Mark as done: task-cli mark-done 1
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
 * List tasks: task-cli list
 * List by status: task-cli list done / todo / in-progress
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

// Parse command line arguments
program.parse(process.argv)
