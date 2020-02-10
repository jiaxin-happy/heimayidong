module.exports = {
  // 覆盖蓝色主题
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          blue: ' #4bb0ff'
        }
      }
    }
  },
  configureWebpack: (config) => {
    // config参数就是苍穹vue-cli项目所有的webpack配置信息
    // 直接修改这个信息就可以了
    // 判断当前环境是否为生产环境
    if (process.env.NODE_ENV === 'production') {
      // 表示webpack会在生产环境下运行
      // 把所有的console都删除掉 然后打包
      // 这里的删除 并不是删除源代码的console 而是删除打包出来的console
      // drop_console 是删除所有的console
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  publicPath: './' // 默认值是/  改成./
}
