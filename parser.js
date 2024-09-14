const IF_TEMP = '#ifdef((?:\\s+\\w+)+)';
const ELSE_IF_REG = '#elif((?:\\s+\\w+)+)';
const ELSE_REG = '#else';
const END_REG = '#endif';

export function parseContent(content, plat, formatter = val => val) {
  if (typeof content !== 'string') {
    return '';
  }
  const ifReg = new RegExp(
    `${formatter(IF_TEMP)}([\\w\\W]*?)${formatter(END_REG)}`,
    'g'
  );

  function includePlat(platString = '') {
    return platString.split(' ').includes(plat);
  }

  const elifReg = new RegExp(
    `${formatter(ELSE_IF_REG)}|(${formatter(ELSE_REG)})`,
    'g'
  );
  // 每匹配到一段 #ifdef 和 #endif ，则进行一次内容替换
  return content.replace(ifReg, ($, platString, code = '') => {
    // 从 0 开始匹配
    elifReg.lastIndex = 0;
    let lastIndex = 0;
    let isMatched = false;
    let result = null;
    while (true) {
      isMatched = includePlat(platString);

      result = elifReg.exec(code);
      if (!result) {
        // 所有 plat 未匹配到 (else & else if), 返回 lastIndex 到最后
        return isMatched ? code.slice(lastIndex) : '';
      }

      // 匹配到 else if, 并且上一个 platString 含有当前 plat 就分割到当前
      if (isMatched) {
        return code.slice(lastIndex, result.index);
      }

      if (result[2]) {
        // 匹配到 else
        platString = plat;
      } else {
        // 下一次查询开始的位置, 和 platform
        platString = result[1];
      }

      lastIndex = elifReg.lastIndex;
    }
  });
}