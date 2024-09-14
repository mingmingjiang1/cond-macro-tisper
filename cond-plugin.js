"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (_ref, opts = { debug: '// #if', linesToRemove: 1 }) {
    var IF = "#if";
    var ELIF = "#elif";
    var ELSE = "#else";
    var ENDIF = "#endif";
    var DEFINE = "#define";
    console.log(8748484, opts)
    const stack = [];

    return {
        visitor: {
            StringLiteral: function StringLiteral(path, state) {
                var str = path.node.value;
                if (str.substring(0, DEFINE.length) === DEFINE) {
                    onDefine(path, state, str.substring(DEFINE.length + 1));
                    path.remove();
                } else if (str.substring(0, IF.length) === IF) {
                    onIf(path, state, str.substring(IF.length + 1));
                    path.remove();
                } else if (str.substring(0, ELIF.length) === ELIF) {
                    onElif(path, state, str.substring(ELIF.length + 1));
                    path.remove();
                } else if (str.substring(0, ELSE.length) === ELSE) {
                    onElse(path, state, str.substring(ELSE.length + 1));
                    path.remove();
                } else if (str.substring(0, ENDIF.length) === ENDIF) {
                    onEndif(path, state, str.substring(ENDIF.length + 1));
                    path.remove();
                }
            },

            ImportDeclaration: {
                enter(path, state) {
                    const prev = path;
                    const startIndex = stack?.length;
                    const cond = prev.node.leadingComments?.[startIndex]?.value;
                    if (/^\s*#if (.*)/.test(cond)) {
                        stack.push({});
                        path.remove();
                    } else if (/^\s*#elif (.*)/.test(cond)) {
                        stack.push({});
                        path.remove();
                    } else if (/^\s*#else/.test(cond)) {
                        // stack.push({});
                        path.remove();
                    }
                }
            },

            Statement: {
                exit: function exit(path, state) {
                    try {
                        if (state.remove) {
                            path.remove();
                        }
                    } catch (e) {}
                }
            }
        }
    };

    function onIf(path, state, code) {
        var cond = evaluate(state, code);
        console.log(cond, 8885)
        if (!cond) {
            state.remove = true;
        } else {
            state.remove = false;
            state.satisfied = true;
        }
    }

    function onElif(path, state, code) {
        if (state.satisfied) {
            state.remove = true;
            return;
        } else {
            var cond = evaluate(state, code);
            if (!cond) {
                state.remove = true;
            } else {
                state.remove = false;
                state.satisfied = true;
            }
        }
    }

    function onElse(path, state, code) {
        if (state.satisfied) {
            state.remove = true;
        } else {
            state.remove = false;
        }
    }

    function onEndif(path, state, code) {
        state.remove = false;
        state.satisfied = false;
    }

    function onDefine(path, state, code) {
        var _code$split = code.split(" ");

        var _code$split2 = _slicedToArray(_code$split, 2);

        var name = _code$split2[0];
        var value = _code$split2[1];


        if (Object.hasOwnProperty(state.opts, name)) {
            //------- #define directives DO NOT OVERWRITE plugin options
            return;
        }

        if (code.indexOf(" ") === -1) {
            //------- no value provided: use true as value
            value = true;
        } else {
            value = eval(value);
        }

        state.opts[name] = value;
    }

    function evaluate(state, code) {
        var paramNames = Object.keys(state.opts);
        var paramValues = paramNames.map(function (name) {
            return state.opts[name];
        });
        code = "return " + code;
        return Function.apply(void 0, paramNames.concat(code)).apply(void 0, paramValues);
    }
};
