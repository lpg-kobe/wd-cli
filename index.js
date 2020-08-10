#!/usr/bin/env node
/* eslint-disable camelcase */
/**
 * Created by mapbar_front on 2020-02-17.
 */
const fs = require('fs')
const program = require('commander')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
// const path = require('path')

const template_vue_pc = 'https://github.com:mapbar-front/template-vue-pc#master'
const template_react_pc = 'https://github.com:mapbar-front/template-react-pc#master'
const template_vue_mobile = 'https://github.com:mapbar-front/template-vue-m#master'
const template_react_mobile = 'https://github.com:mapbar-front/template-react-m#master'

const templateConfig = {
  template_vue_pc,
  template_react_pc,
  template_vue_mobile,
  template_react_mobile
}

program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([
        {
          name: 'description',
          message: '请输入项目描述：'
        },
        {
          name: 'author',
          message: '请输入作者名称：'
        },
        {
          type: 'input',
          name: 'library',
          message: '请选择框架类型（react/vue）：',
          validate (input) {
            const done = this.async()
            if (!input) {
              done('请输入项目名称')
              return
            }
            if (!/^react$/.test(input) && !/^vue$/.test(input)) {
              done('框架类型只能为 react 或者 vue')
              return
            }
            done(null, true)
          }
        },
        {
          type: 'input',
          name: 'template',
          message: '请输入模板类型（pc/mobile）：',
          validate (input) {
            const done = this.async()
            if (!input) {
              done('请输入项目名称')
              return
            }
            if (!/^pc$/.test(input) && !/^mobile$/.test(input)) {
              done('框架类型只能为 pc 或者 mobile')
              return
            }
            done(null, true)
          }
        }
      ]).then((answers) => {
        const spinner = ora('正在下载模板...')
        spinner.start()
        const templateStr = `template_${answers.library}_${answers.template}`
        const TEMPLATE = templateConfig[templateStr]
        download(TEMPLATE, name, { clone: true }, (err) => {
          if (err) {
            spinner.fail()
            console.log(symbols.error, chalk.red(err))
          } else {
            spinner.succeed()
            const fileName = `${name}/package.json`
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }
            if (fs.existsSync(fileName)) {
              const content = fs.readFileSync(fileName).toString()
              const result = handlebars.compile(content)(meta)
              fs.writeFileSync(fileName, result)
            }
            console.log(symbols.success, chalk.green('项目初始化完成'))
          }
        })
      })
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'))
    }
  })
program.parse(process.argv)
