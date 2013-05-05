var Lexem = function ( type, val ) {
    this.type = type;
    this.val = val;
};

Lexem.prototype.toString = function () {
    return this.type + " " + this.val;
};

function printTokenList( list ) {
    for ( var i = 0; i < list.length; i++ ) {
        var obj = list[i];
        console.log( obj );
    }
}

(function () {
    var that = window.parser = {};

    var dlexer = window.dlexer = function ( str ) {
        var tokens = [];

        var isFn = function ( str ) {
            return str.slice( 0, 4 ).toLowerCase() === "sqrt";
        };

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

                while ( isNum( str[i + 1] ) || str[i + 1] == "." ) {
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

    var Tree = function ( cargo, left, right ) {
        this.cargo = cargo;
        this.left = left;
        this.right = right;
    }

    Tree.prototype.d3export = function () {
        var res = {};
        if ( this.cargo != undefined ) {
            res.title = this.cargo.val;
        }
        res.children = [];
        if ( this.left != undefined ) {
            res.children.push( this.left.d3export() );
        }
        if ( this.right != undefined ) {
            res.children.push( this.right.d3export() );
        }
        return res;
    };

    Tree.prototype.toString = function () {
        return this.cargo.toString();
    }

    that.toMathML = function ( tree ) {
        var res = "";
        console.log( "CARGO", tree.cargo.type, tree.cargo.val );
        if ( tree.cargo.type == "num" || tree.cargo.type == "var" ) {
            res += '<mn>' + tree.cargo.val + '</mn>';
        }

        if ( tree.cargo.val == "<=" ) {
            res += that.toMathML( tree.left ) + '<mo>&#x2264;</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == ">=" ) {
            res += that.toMathML( tree.left ) + '<mo>&#x2265;</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == "<" ) {
            res += that.toMathML( tree.left ) + '<mo>&lt;</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == ">" ) {
            res += that.toMathML( tree.left ) + '<mo>&gt;</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == "=" ) {
            res += that.toMathML( tree.left ) + '<mo>=</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == "^" ) {
            res += '<msup>' + that.toMathML( tree.left ) + '</mi><mi>' + that.toMathML( tree.right ) + '</msup>';
        }

        if ( tree.cargo.val == "(" ) {
            res += '<mfenced separators="" open="(" close=")">' + that.toMathML( tree.left ) + '</mfenced>';
        }

        if ( tree.cargo.val == "*" ) {
            res += that.toMathML( tree.left ) + '<mo>&#183;</mo>' + that.toMathML( tree.right );
        }

        if ( tree.cargo.val == "+" ) {
            res += '<mrow>' + that.toMathML( tree.left ) + '<mo>+</mo>' + that.toMathML( tree.right ) + '</mrow>';
        }

        if ( tree.cargo.val == "-" ) {
            res += '<mrow>' + that.toMathML( tree.left ) + '<mo>-</mo>' + that.toMathML( tree.right ) + '</mrow>';
        }

        if ( tree.cargo.val == "/" ) {
            res += '<mfrac><mrow>' + that.toMathML( tree.left ) + '</mrow><mrow>' + that.toMathML( tree.right ) + '</mrow></mfrac>'
        }

        if ( tree.cargo.val == "sqrt" ) {
            res += '<msqrt>' + that.toMathML( tree.left ) + '</msqrt>';
        }
        if ( ~["cos", "sin", "tg", "ctg"].indexOf( tree.cargo.val ) ) {
            res += '<mrow><mi>' + tree.cargo.val + '</mi><mo>(</mo>' + that.toMathML( tree.left ) + '<mo>)</mo></mrow>';
        }
        return res;
    };

    that.printTreeIndented = function ( tree, level ) {
        if ( !tree ) return;
        level = level || 0;
        that.printTreeIndented( tree.right, level + 2 );
        var filler = new Array( level ).join( " " );
        console.log( filler + tree.cargo );
        that.printTreeIndented( tree.left, level + 2 );
    }

    that.printTreeInorder = function ( tree ) {
        if ( !tree ) return;
        console.log( that.printTreeInorder( tree.left ) );
        console.log( tree.cargo );
        console.log( that.printTreeInorder( tree.right ) );
    }

    that.printTreePostorder = function ( tree ) {
        if ( !tree ) return;
        console.log( that.printTreePostorder( tree.left ) );
        console.log( that.printTreePostorder( tree.right ) );
        console.log( tree.cargo );
    }

    that.getToken = function ( tokenList, expected ) {
        if ( tokenList[0].val === expected ) {
            return tokenList.shift();
        }
        return false;
    }

    that.getNumber = function ( tokenList ) {
        var nextTkn;
        if ( nextTkn = (that.getToken( tokenList, "sqrt" )
            || that.getToken( tokenList, "cos" )
            || that.getToken( tokenList, "sin" )
            || that.getToken( tokenList, "tg" )
            || that.getToken( tokenList, "ctg" )
            )
            ) {
            if ( !that.getToken( tokenList, "(" ) ) {
                throw new Error( "expected )" );
            }
            var x = that.getSum( tokenList );
            if ( !that.getToken( tokenList, ")" ) ) {
                throw new Error( "expected )" );
            }
            return new Tree( nextTkn, x, x );
        }
        if ( that.getToken( tokenList, "(" ) ) {
            var x = that.getSum( tokenList );
            if ( !that.getToken( tokenList, ")" ) ) {
                throw new Error( "expected )" );
            }
//            return x;
            return new Tree( new Lexem( "bracket", "(" ), x );
        } else {
            var x = tokenList[0];
            console.log( "TOKEN", x );
            if ( x.type == "num" || x.type == "var" ) {
                tokenList.shift();
//                if ( nextTkn = that.getToken( tokenList, "^" ) ) {
//                    return new Tree( nextTkn, new Tree( x ), that.getSum( tokenList ) );
//                }
                return new Tree( x );
            }
            return false;
        }
    }
    that.getDelim = function ( tokenList ) {

        console.log( "TOKEN LIST", tokenList );

        var a = that.getSum( tokenList )
            , b
            , nextTkn;
        if ( nextTkn = that.getToken( tokenList, "<=" ) ) {
            b = that.getDelim( tokenList );
            return new Tree( nextTkn, a, b );
        }
        if ( nextTkn = that.getToken( tokenList, ">=" ) ) {
            b = that.getDelim( tokenList );
            return new Tree( nextTkn, a, b );
        }
        if ( nextTkn = that.getToken( tokenList, "<" ) ) {
            b = that.getDelim( tokenList );
            return new Tree( nextTkn, a, b );
        }

        if ( nextTkn = that.getToken( tokenList, "=" ) ) {
            b = that.getDelim( tokenList );
            return new Tree( nextTkn, a, b );
        }
        if ( nextTkn = that.getToken( tokenList, ">" ) ) {
            b = that.getDelim( tokenList );
            return new Tree( nextTkn, a, b );
        }
        return a;
    }

    that.getSum = function ( tokenList ) {
        var a = that.getProduct( tokenList )
            , b
            , nextTkn;
        if ( nextTkn = that.getToken( tokenList, "+" ) ) {
            b = that.getSum( tokenList );
            return new Tree( nextTkn, a, b );
        }
        if ( nextTkn = that.getToken( tokenList, "-" ) ) {
            b = that.getSum( tokenList );
            return new Tree( nextTkn, a, b );
        }
        return a;
    }

    that.getFactor = function ( tokenList ) {
        var a = that.getNumber( tokenList )
            , nextTkn
            , b;

        if ( nextTkn = that.getToken( tokenList, "^" ) ) {
            b = that.getFactor( tokenList );
            return new Tree( nextTkn, a, b );
        }

        return a;
    }

    that.getProduct = function ( tokenList ) {
        var a = that.getFactor( tokenList )
            , nextTkn
            , b;
        if ( nextTkn = that.getToken( tokenList, "*" ) ) {
            b = that.getProduct( tokenList );
            return new Tree( nextTkn, a, b );
        }
        if ( nextTkn = that.getToken( tokenList, "/" ) ) {
            b = that.getProduct( tokenList );
            return new Tree( nextTkn, a, b );
        }
        return a;
    }

})();
var input = document.getElementById( "math-expr" );

document.getElementById( "math-convert" ).addEventListener( "click", function ( e ) {
    var token_list = dlexer( input.value );
    token_list.push( new Lexem( "end", "end" ) );
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
//    console.log( "TOKENLIST AFTER" );
//    printTokenList( newTokenList );

    var x = parser.getDelim( newTokenList );

    console.log( "X", x );
    var y = parser.toMathML( x );
    console.log( y );
    document.getElementById( "out" ).innerHTML = '<math  xmlns="http://www.w3.org/1998/Math/MathML">' + y + '</math>';
    document.getElementById( "mathmlcode" ).textContent = y;
    parser.printTreeIndented( x );
    var d3tree = x.d3export();
    drawTree( d3tree );
    MathJax.Hub.Queue( ["Typeset", MathJax.Hub] );
} );
