#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('process.argv', process.argv);
const args = process.argv.slice(2);
console.log('接收到的參數：', args);
