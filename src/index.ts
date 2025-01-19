#!/usr/bin/env node
import { program } from 'commander'

program
  .name('task-cli')
  .description('An Task CLI written in TypeScript')
  .version('1.0.0')

program
  .command('greet <name>')
  .description('Greets a user by name')
  .action((name: string) => {
    console.log(`Hello, ${name}!`)
  })

program.parse(process.argv)
