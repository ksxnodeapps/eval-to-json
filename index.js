#! /usr/bin/env node
'use strict'

const {resolve, dirname} = require('path')
const {runInNewContext} = require('vm')
const {readFileSync} = require('fs')
const {exit, argv, cwd} = require('process')
const getStdIn = require('get-stdin')
const {stringify} = JSON
const {info, error} = global.console

const success = message => {
  info(message)
  exit(0)
}

const failure = (message, code = 1) => {
  error(message)
  exit(code)
}

const reqfn = (dirname = cwd()) => name => {
  const string = String(name)
  return require(string.slice(2) === './' ? resolve(dirname, string) : string)
}

const main = (code, context) =>
  stringify(runInNewContext(code, context), undefined, 2)

const filename = argv[2]
if (filename) {
  const file = resolve(cwd(), filename)
  const dir = dirname(file)
  success(
    main(
      readFileSync(file, 'utf8'),
      {
        require: reqfn(dir),
        __dirname: dir,
        __filename: file
      }
    )
  )
}

getStdIn()
  .then(
    value => {
      const string = String(value)
      if (!string) return failure(readFileSync(resolve(__dirname, 'help.txt'), 'utf8'), 0)
      const dir = cwd()
      return success(
        main(
          string,
          {
            require: reqfn(dir),
            __dirname: dir,
            __filename: undefined
          }
        )
      )
    }
  )
  .catch(failure)
