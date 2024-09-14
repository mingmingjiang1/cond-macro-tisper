const conditionalCompilePlugin = options => ({
    name: 'conditionCompile',
    apply(compiler) {
      compiler.hooks['compilerNg:transformComponent'].tapPromise(
        'conditionCompile',
        async source => {
          const { path, code } = source;
          const filter = /(\.[jt]sx$)|(setup\.lepus(\.[jt]s)$)/;
          if (filter.test(path) && code.indexOf('#ifdef') !== -1) {
            console.log('[条件编译] 匹配到条件编译内容:');
            console.log('[条件编译] 文件路径:', path, '目标平台:', process.env.TARGET);
  
            const platform = process.env.TARGET || 'UNSET';
            const sourceResult = handleParser(code, platform);
            return {
              path,
              code: sourceResult,
            };
          }
          return source;
        }
      );
    },
  });