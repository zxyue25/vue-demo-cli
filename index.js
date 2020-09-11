#!/usr/bin/env node
const commander  =  require('commander')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const ora = require('ora')
const fs = require('fs')
const chalk = require('chalk')
const logSymbols = require('log-symbols');

// console.log(process.argv)
const { program } = commander

program
  .version('0.1.0')

const templates = {
    'tpl-a':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateA.git",
        downloadUrl:"https://github.com:zxyue25/vue-demo-cli-templateA#master",
        description:"a模板"
    },
    'tpl-b':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateB.git",
        downloadUrl:"https://github.com:zxyue25/vue-demo-cli-templateB#master",
        description:"b模板"
    },
    'tpl-c':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateC.git",
        downloadUrl:"https://github.com:zxyue25/vue-demo-cli-templateC#master",
        description:"c模板"
    }
}

//按照模板名下载对应的模板到本地并起名为project
program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
      // 下载之前做loading提示
      const spinner = ora('正在下载模板...').start();
      // 根据模板名下载对应的模板到本地
      const {downloadUrl} = templates[templateName]
      download(downloadUrl, projectName, {clone: true}, err => {
          if(err){
            spinner.fail()
            console.log(logSymbols.error, chalk.red(err))
            return 
          }
          spinner.succeed()
          inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: '请输入项目名称'
            },
            {
                type: 'input',
                name: 'description',
                message: '请输入项目简介'
            },
            {
                type: 'input',
                name: 'author',
                message: '请输入作者姓名'
            },
        ]).then((answers) => {
            const packagePath = `${projectName}/package.json`
            const packageContent = fs.readFileSync(packagePath,'utf-8')
            //使用handlebars解析模板引擎
            const packageResult = handlebars.compile(packageContent)(answers)
            //将解析后的结果重写到package.json文件中
            fs.writeFileSync(packagePath,packageResult)
            console.log(logSymbols.success, chalk.yellow('初始化模板成功'))
          })
      })
  });

program
  .command('list')
  .description('查看所有可用模板')
  .action((templateName, projectName) => {
      for(let key in templates){
          console.log(key + '   url:' + templates[key].url)
      }
  });

program.parse(process.argv);