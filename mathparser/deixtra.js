var Lexem = function ( type, val ) {
    this.type = type;
    this.val = val;
};

function printTokenList( list ) {
    for ( var i = 0; i < list.length; i++ ) {
        var obj = list[i];
        console.log( obj );
    }
}

var dlexer = window.dlexer = function ( str ) {
    var tokens = [];

    var isNum = function ( c ) {
        return c >= "0" && c <= "9";
    }

    var isOp = function ( c ) {
        return c === "^" || c === '+' || c === '-' || c === '/' || c === '*' || c === '=' || c === ">" || c === "<";
    }

    var isVar = function ( c ) {
        return c >= "a" && c <= "z";
    }

    for ( var i = 0; i < str.length; i++ ) {
        if ( isNum( str[i] ) ) {
            var d = str[i];

            while (isNum( str[i + 1] ) || str[i + 1] == ".") {
                d += str[i + 1];
                i++;
            }

            tokens.push( new Lexem( "num", parseFloat( d ) ) );
            continue;
        }

        console.log( str[i] );

        if ( str[i] == ")" ) {
            tokens.push( new Lexem( "bracket", ")" ) );
            continue;
        }

        if ( str[i] == "(" ) {
            tokens.push( new Lexem( "bracket", "(" ) );
            continue;
        }

        if ( str[i] == "," ) {
            tokens.push( new Lexem( "del", ',' ) );
            continue;
        }

        if ( str[i] == ">" && str[i + 1] == "=" ) {
            i++;
            tokens.push( new Lexem( "op", ">=" ) );
            continue;
        }
        if ( str[i] == "<" && str[i + 1] == "=" ) {
            i++;
            tokens.push( new Lexem( "op", "<=" ) );
            continue;
        }
        if ( isOp( str[i] ) ) {
            tokens.push( new Lexem( "op", str[i] ) );
            continue;
        }
        if ( str.slice( i, i + 4 ) === "sqrt" ) {
            i += 3;
            tokens.push( new Lexem( "fn", "sqrt" ) );
            continue;
        }
        if ( str.slice( i, i + 3 ) === "ctg" ) {
            i += 2;
            tokens.push( new Lexem( "fn", "ctg" ) );
            continue;
        }
        if ( str.slice( i, i + 3 ) === "sin" ) {
            i += 2;
            tokens.push( new Lexem( "fn", "sin" ) );
            continue;
        }
        if ( str.slice( i, i + 3 ) === "cos" ) {
            i += 2;
            tokens.push( new Lexem( "fn", "cos" ) );
            continue;
        }
        if ( str.slice( i, i + 2 ) === "tg" ) {
            i += 1;
            tokens.push( new Lexem( "fn", "tg" ) );
            continue;
        }
        if ( isVar( str[i] ) ) {
            tokens.push( new Lexem( "var", str[i] ) );
            continue;
        }
    }
    return tokens;
}

var Tree = function ( cargo ) {
    this.cargo = cargo;
    this.leafs = [];
}

Tree.prototype.d3export = function () {
    var res = {};
    if ( this.cargo != undefined ) {
        res.title = this.cargo.val;
    }
    res.children = [];
    for ( var i = 0; i < this.leafs.length; i++ ) {
        res.children.push( this.leafs[i].d3export() );
    }
    return res;
};

Tree.prototype.toString = function () {
    return this.cargo.toString();
};


(function () {
    var dparser = window.dparser = {};

    /**
     * возвращает приоритет оператора
     * @param ch Символ
     * @return {Number}
     */
    dparser.opPerced = function ( ch ) {
        switch (ch) {
            case '^':
                return 4;

            case '*':
            case '/':

            case '+':
            case '-':
                return 2;

            case '=':
                return 1;
        }
        return 0;
    }

    dparser.opLeftAssoc = function ( ch ) {
        switch (ch) {
            // лево-ассоциативные операторы
            case '*':
            case '/':
            case '%':
            case '+':
            case '-':
            case '^':
            case '=':
                return true;
        }
        return false;
    }

    dparser.opArgCount = function ( ch ) {
        switch (ch) {
            case '*':
            case '/':
            case '+':
            case '-':
            case '=':
                return 2;
            case 'sqrt':
            case 'cos':
            case 'sin':
            case 'tg':
            case 'ctg':
                return 1;

            default:
                return 0;
        }
    }

    dparser.shuntingYard = function ( input ) {
        var strpos = 0;
        var strend = input.length;
        var c,
            stack = [],
            sc,
            bracketOpArgCount = 0,
            output = [],
            outpos = 0;
        var sl = 0;
        while (strpos < strend) {
            bracketOpArgCount = 0;
            c = input[strpos];
            if ( c.val !== ' ' ) {
                // Если токен является числом (идентификатором), то добавить его в очередь вывода.
                if ( c.type == "var" || c.type == "num" ) {
                    output[outpos] = c;
                    ++outpos;
                }
                // Если токен - функция, то положить его в стек.
                else if ( c.type == "fn" ) {
                    stack[sl] = c;
                    ++sl;
                }
                //Если токен - разделитель аргументов функции (запятая):
                else if ( c.type == "def" ) {
                    var pe = false;
                    while (sl > 0) {
                        sc = stack[sl - 1];
                        if ( sc.val === '(' ) {
                            pe = true;
                            break;
                        }
                        else {
                            // Пока на вершине не левая круглая скобка,
                            // перекладывать операторы из стека в очередь вывода.
                            output[outpos] = sc;
                            ++outpos;
                            sl--;
                        }
                    }
                    // Если не была достигнута левая круглая скобка, либо разделитель не в том месте
                    // либо была пропущена скобка
                    if ( !pe ) {
                        console.log( "Error: separator or parentheses mismatched\n" );
                        return false;
                    }
                }
                // Если токен оператор op1, то:
                else if ( c.type == "op" ) {
                    while (sl > 0) {
                        sc = stack[sl - 1];
                        // Пока на вершине стека присутствует токен оператор op2,
                        // а также оператор op1 лево-ассоциативный и его приоритет меньше или такой же чем у оператора op2,
                        // или оператор op1 право-ассоциативный и его приоритет меньше чем у оператора op2
                        if ( sc.type == "op" &&
                            ((dparser.opLeftAssoc( c.val ) && (dparser.opPerced( c.val ) <= dparser.opPerced( sc.val ))) ||
                                (!dparser.opLeftAssoc( c.val ) && (dparser.opPerced( c.val ) < dparser.opPerced( sc.val )))) ) {
                            // Переложить оператор op2 из стека в очередь вывода.
                            output[outpos] = sc;
                            ++outpos;
                            sl--;
                        }
                        else {
                            break;
                        }
                    }
                    // положить в стек оператор op1
                    stack[sl] = c;
                    ++sl;
                }
                // Если токен - левая круглая скобка, то положить его в стек.
                else if ( c.val === '(' ) {
                    stack[sl] = c;
                    ++sl;
                }
                // Если токен - правая круглая скобка:
                else if ( c.val === ')' ) {
                    var pe2 = false;
                    // До появления на вершине стека токена "левая круглая скобка"
                    // перекладывать операторы из стека в очередь вывода.
                    while (sl > 0) {
                        bracketOpArgCount++;
                        sc = stack[sl - 1];
                        if ( sc.val == '(' ) {
                            pe2 = true;
                            break;
                        }
                        else {
                            output[outpos] = sc;
                            ++outpos;
                            sl--;
                        }
                    }
                    // Если стек кончится до нахождения токена левая круглая скобка, то была пропущена скобка.
                    if ( !pe2 ) {
                        console.log( "Error: parentheses mismatched\n" );
                        return false;
                    }
                    // выкидываем токен "левая круглая скобка" из стека (не добавляем в очередь вывода).
                    output[outpos] = new Lexem( "bracket", "(" );
                    output[outpos].count = bracketOpArgCount;
                    ++outpos;
                    sl--;
                    // Если на вершине стека токен - функция, положить его в стек.
                    if ( sl > 0 ) {
                        sc = stack[sl - 1];
                        if ( sc.type == "fn" ) {
                            output[outpos] = sc;
                            ++outpos;
                            sl--;
                        }
                    }
                }
                else {
                    console.log( "Unknown token ", c, "\n" );
                    return false; // Unknown token
                }
            }
            ++strpos;
        }
        // Когда не осталось токенов на входе:
        // Если в стеке остались токены:
        while (sl > 0) {
            sc = stack[sl - 1];
            if ( sc.val === '(' || sc.val === ')' ) {
                console.log( "Error: parentheses mismatched\n" );
                return false;
            }
            output[outpos] = sc;
            ++outpos;
            --sl;
        }

//        outpos = 0; // Добавляем завершающий ноль к строке
        output.push( "~" );
        console.log( stack, output );
        return output;
    }

    dparser.executionOrder = function ( input ) {
        printTokenList( input );
        var strpos = 0;
        var strend = input.length;
        var tree;
        var nargs;
        var c, res = [];
        var sl = 0, sc, stack = [], rn = 0;
        // Пока на входе остались токены
        while (strpos < strend) {
            // Прочитать следующий токен
            c = input[strpos];
            // Если токен - значение или идентификатор
            if ( c.type == "bracket" ) {
                res = new Tree( c );
                res.leafs.unshift( stack[sl - 1] );
                sl--;
                stack[sl] = res;
                ++sl;
                console.log( "BRACKET", res );

            }
            if ( c.type == "var" || c.type == "num" ) {
                console.log( c, " eto indent" );
                // Поместить его в стек
                stack[sl] = new Tree( c );
                ++sl;
            }
            // В противном случае, токен - оператор (здесь под оператором понимается как оператор, так и название функции)
            if ( c.type == "fn" || c.type == "op" ) {
//                res = rn;
                ++rn;
                // Априори известно, что оператор принимает n аргументов
                nargs = dparser.opArgCount( c.val );
                // Если в стеке значений меньше, чем n
                if ( sl < nargs ) {
                    // (ошибка) Недостаточное количество аргументов в выражении.
                    throw new Error( "Недостаточное количество аргументов в выражении. Ожидалось: ", nargs );
                }
                // В противном случае, взять последние n аргументов из стека
                // Вычислить оператор, взяв эти значения в качестве аргументов

                if ( c.type == "fn" ) {
                    res = new Tree( c );

                    console.log( c.val + "(" );
                    while (nargs > 0) {
                        sc = stack[sl - 1];
                        sl--;
                        res.leafs.unshift( sc );
                        --nargs;
                    }
                }
                else {
                    if ( nargs == 1 ) {
                        console.log( c + " is unary op" );
                        sc = stack[sl - 1];
                        sl--;
                        res = new Tree( c );
                        res.leafs.unshift( sc );
                    }
                    else {
                        var sc1 = stack[sl - 1];
                        var sc2 = stack[sl - 2];
                        res = new Tree( c );
                        res.leafs.unshift( sc1 );
                        res.leafs.unshift( sc2 );
                        sl -= 2;
                    }
                }
                // Если получены результирующие значения, поместить таковые в стек.
                console.log( "SL", sl, "RES", res );
                console.log( "STACK", stack );
                stack[sl] = res;
                ++sl;
            }
            ++strpos;
        }
        // Если в стеке осталось лишь одно значение,
        // оно будет являться результатом вычислений.
        if ( sl === 1 ) {
            sc = stack[sl - 1];
            sl--;
            console.log( sc, "is a result\n" );
            return sc;
        }
        // Если в стеке большее количество значений,
        // (ошибка) Пользователь ввёл слишком много значений.
        return false;
    }

    dparser.toMathML = function ( tree ) {
            var res = "";
            console.log( "CARGO", tree.cargo.type, tree.cargo.val );
            if ( tree.cargo.type == "num" || tree.cargo.type == "var" ) {
                res += '<mn>' + tree.cargo.val + '</mn>';
            }

            if ( tree.cargo.val == "<=" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>&#x2264;</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == ">=" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>&#x2265;</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == "<" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>&lt;</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == ">" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>&gt;</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == "=" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>=</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == "^" ) {
                res += '<msup>' + dparser.toMathML( tree.leafs[0] ) + '</mi><mi>' + dparser.toMathML( tree.leafs[1] ) + '</msup>';
            }

            if ( tree.cargo.val == "(" ) {
                res += '<mfenced separators="" open="(" close=")">' + dparser.toMathML( tree.leafs[0] ) + '</mfenced>';
            }

            if ( tree.cargo.val == "*" ) {
                res += dparser.toMathML( tree.leafs[0] ) + '<mo>&#183;</mo>' + dparser.toMathML( tree.leafs[1] );
            }

            if ( tree.cargo.val == "+" ) {
                res += '<mrow>' + dparser.toMathML( tree.leafs[0] ) + '<mo>+</mo>' + dparser.toMathML( tree.leafs[1] ) + '</mrow>';
            }

            if ( tree.cargo.val == "-" ) {
                res += '<mrow>' + dparser.toMathML( tree.leafs[0] ) + '<mo>-</mo>' + dparser.toMathML( tree.leafs[1] ) + '</mrow>';
            }

            if ( tree.cargo.val == "/" ) {
                res += '<mfrac><mrow>' + dparser.toMathML( tree.leafs[0] ) + '</mrow><mrow>' + dparser.toMathML( tree.leafs[1] ) + '</mrow></mfrac>'
            }

            if ( tree.cargo.val == "sqrt" ) {
                res += '<msqrt>' + dparser.toMathML( tree.leafs[0] ) + '</msqrt>';
            }
            if ( ~["cos", "sin", "tg", "ctg"].indexOf( tree.cargo.val ) ) {
                res += '<mrow><mi>' + tree.cargo.val + '</mi>' + dparser.toMathML( tree.leafs[0] ) + '</mrow>';
            }
            return res;
        };

    dparser.main = function ( expr ) {
        var token_list = dlexer( expr );
        console.log( "TOKENLIST BEFORE" );
        printTokenList( token_list );

        var newTokenList = [];
        for ( var i = 0; i < token_list.length; i++ ) {

            //        if ( token_list[i].val == "-" && token_list[i + 1] && (token_list[i + 1].type == "var" || token_list[i + 1] == "num") ) {
            //            if ( token_list[i].type == "var" ) {
            //                newTokenList.push( new Lexem( "var", "-" + token_list[i].val ) );
            //
            //            }
            //        }
            if ( token_list[i].type == "num" && token_list[i + 1] && token_list[i + 1].type == "var" ) {
                newTokenList.push( token_list[i] );
                newTokenList.push( new Lexem( "op", "*" ) );
            } else {
                newTokenList.push( token_list[i] );
            }
        }
        console.log( "TOKENLIST AFTER" );
        printTokenList( newTokenList );
        var output = dparser.shuntingYard( newTokenList );
        if ( output ) {
            return dparser.executionOrder( output );
        }
    }

    var input = document.getElementById( "math-expr" );

    document.getElementById( "math-convert" ).addEventListener( "click", function ( e ) {
        var x = dparser.main( input.value );
        console.log( "X", x );
        var y = dparser.toMathML( x );
        console.log( y );
        document.getElementById( "out" ).innerHTML = '<math  xmlns="http://www.w3.org/1998/Math/MathML">' + y + '</math>';
        document.getElementById( "mathmlcode" ).textContent = y;
        var d3tree = x.d3export();
        drawTree( d3tree );
        MathJax.Hub.Queue( ["Typeset", MathJax.Hub] );
    } );
})();