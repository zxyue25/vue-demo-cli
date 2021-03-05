# vue-demo-cli
仿照vue-cli学习实现一个简单的脚手架

https://juejin.cn/post/6871183366029312014#heading-3

脚手架：命令行工具
作用：减少重复性工作，不再需要复制其他项目再删除
step 1 初始化
1、新建项目vue-demo-cli
2、npm -y init 初始化package.json
3、配置package.json中bin字段
 "bin": {
    "abc": "index.js"
  },
复制代码
4、新建index.js写入
//带有#!就是代表此文件可以当做脚本运行
// /usr/bin/env node这行的意思就是用node来执行此文件，node怎么来呢，就去用户(usr)的安装根目录(bin)下的env环境变量中去找
#!/usr/bin/env node
console.log("vue-demo-cli")
复制代码
5、执行npm link链接命令到全局
6、终端验证

step 2 使用commander解析命令行参数
脚手架命令行工具参数设计
比如vue-cli命令行工具参数：

实现思路：

获取用户命令
根据不同的命令执行不同的功能操作

获取用户命令
1、使用node process.argv：

process.argv 属性会返回一个数组，其中包含当 Node.js 进程被启动时传入的命令行参数。 第一个元素是 process.execPath。 如果需要访问 argv[0] 的原始值，则参见 process.argv0。 第二个元素是正被执行的 JavaScript 文件的路径。 其余的元素是任何额外的命令行参数

//index.js
#!/usr/bin/env node
console.log(process.argv)
复制代码

2、使用commander第三方包解析命令 github.com/tj/commande…
#!/usr/bin/env node
const commander  =  require('commander')
const { program } = commander

program
  .version('0.1.0')

//在github准备模板
const templates = {
    'tpl-a':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateA.git",
        description:"a模板"
    },
    'tpl-b':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateB.git",
        description:"b模板"
    },
    'tpl-c':{
        url:"https://github.com/zxyue25/vue-demo-cli-templateC.git",
        description:"c模板"
    }
}

//按照模板名下载对应的模板到本地并起名为project
program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
      console.log(templateName)
      console.log(projectName)
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
复制代码
step 3 根据指定模板名、项目名下载模板
使用第三方包download-git-repo下载模板
//npm install download-git-repo
const download = require('download-git-repo')

//在github准备模板
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
  	const { downloadUrl } = templates[templateName]
    // downloadUrl:"https://github.com:zxyue25/vue-demo-cli-templateC#master",
    // 仓库地址:用户名/项目名#分支名
    download(downloadUrl, projectName, {clone: true}, (err) => {
    	if(err){
        	console.log("下载失败")
        }else{
        	console.log("下载成功")
        }
    })
  });
复制代码

step 4 命令行交互
实现思路：

把项目下的package.json文件读取出来
使用向导的方式采集用户输入的值**(inquirer)**
使用模板引擎把用户输入的数据解析到package.json文件中**(handerbars)**
把解析之后的结果重新写到package.json中

//模板A项目工程 新增package.json
{
  "name": "{{ name }}",
  "version": "1.0.0",
  "description": "{{ description }}",
  "main": "index.js",
  "dependencies": {
    "commander": "^6.1.0",
    "download-git-repo": "^3.0.2"
  },
  "devDependencies": {},
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "{{ author }}",
  "license": "ISC",
  "bin": {
    "cli": "index.js"
  }
}
复制代码
//index.js
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const fs = require('fs')

//按照模板名下载对应的模板到本地并起名为project
program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
      // 根据模板名下载对应的模板到本地

      const {downloadUrl} = templates[templateName]
      download(downloadUrl, projectName, {clone: true}, err => {
          if(err){
            return console.log("下载失败")
          }
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
            console.log('初始化模板成功')
          })
      })
  });
复制代码


step 5 使用ora增加下载中loading效果
const ora = require('ora')
...
  .action((templateName, projectName) => {
      // 下载之前做loading提示
      const spinner = ora('正在下载模板...').start();
      // 根据模板名下载对应的模板到本地
      const {downloadUrl} = temples[templateName]
      download(downloadUrl, projectName, {clone: true}, err => {
          if(err){
            spinner.fail()
            return 
          }
          spinner.succeed()
...
复制代码

step 6 使用chalk美化、log-symbols增加文本样式
const chalk = require('chalk')
console.log(logSymbols.success, chalk.yellow('初始化模板成功'))
console.log(logSymbols.error, chalk.red(err))
复制代码

step 7 npm发包
npmjs官网发包：

检索包名是否重名
将package.json中的name修改为发布到npm的包名（和本地工程项目名字无关）
打开控制台，npm login，在控制台登录npm
登陆成功后在项目下执行npm publish发布
发布成功本地npm install下载测试

作者：Jona79314
链接：https://juejin.cn/post/6871183366029312014
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。