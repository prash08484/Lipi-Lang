

// CODE TOKENIZER
function lexer(input) {
    let cursor = 0;
    const tokens = [];

    while (cursor < input.length) {
        let char = input[cursor];

        // Whitespace
        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        // Identifier / keyword
        if (/[a-zA-Z]/.test(char)) {
            let word = '';
            while (char && /[a-zA-Z0-9]/.test(char)) {
                word += char;
                char = input[++cursor];
            }
            if (word === 'ye' || word === 'bol') {
                tokens.push({ type: 'keyword', value: word });
            } else {
                tokens.push({ type: 'identifier', value: word });
            }
            continue;
        }

        // Number
        if (/[0-9]/.test(char)) {
            let num = '';
            while (char && /[0-9]/.test(char)) {
                num += char;
                char = input[++cursor];
            }
            tokens.push({ type: 'number', value: num });
            continue;
        }

        // Operators / assignment
        if (/[\+\-\*\/=]/.test(char)) {
            tokens.push({ type: 'operator', value: char });
            cursor++;
            continue;
        }

        throw new Error(`Unexpected character '${char}' at position ${cursor}`);
    }

    return tokens;
}


// CODE PARSER 
function parser(tokens) {
    const ast = { type: 'Program', body: [] };

    while (tokens.length) {
        const tok = tokens.shift();

        // Declaration: ye <identifier> (= <expression>)?
        if (tok.type === 'keyword' && tok.value === 'ye') {
            if (!tokens.length || tokens[0].type !== 'identifier') {
                throw new Error('Expected identifier after "ye"');
            }
            const nameTok = tokens.shift();
            let value = null;

            if (tokens[0] && tokens[0].type === 'operator' && tokens[0].value === '=') {
                tokens.shift(); // consume '='
                // Gather expression tokens until next statement keyword or end
                const exprParts = [];
                while (
                    tokens.length &&
                    !(tokens[0].type === 'keyword' && (tokens[0].value === 'ye' || tokens[0].value === 'bol'))
                ) {
                    const part = tokens.shift();
                    // basic validation: expression tokens can be identifier, number, operator
                    if (!['identifier', 'number', 'operator'].includes(part.type)) {
                        throw new Error(`Invalid token in expression: ${JSON.stringify(part)}`);
                    }
                    exprParts.push(part.value);
                }
                value = exprParts.join('');
            }

            ast.body.push({
                type: 'Declaration',
                name: nameTok.value,
                value
            });
            continue;
        }

        // Print: bol <identifier|number>
        if (tok.type === 'keyword' && tok.value === 'bol') {
            if (!tokens.length || !['identifier', 'number'].includes(tokens[0].type)) {
                throw new Error('Expected identifier or number after "bol"');
            }
            const exprTok = tokens.shift();
            ast.body.push({
                type: 'Print',
                expression: exprTok.value
            });
            continue;
        }

        throw new Error(`Unexpected token at top level: ${JSON.stringify(tok)}`);
    }

    return ast;
}



// CODE GENERATOR
function codeGen(node) {
    switch (node.type) {
        case 'Program':
            return node.body.map(codeGen).join('\n');
        case 'Declaration':
            // If no initializer, default to undefined
            return node.value == null
                ? `const ${node.name} = undefined`
                : `const ${node.name} = ${node.value}`;
        case 'Print':
            return `console.log(${node.expression})`;
        default:
            throw new Error(`Unknown AST node type: ${node.type}`);
    }
}


// CODE COMPILER
function compile(input) {
    const tokens = lexer(input);
    const ast = parser(tokens);
    const js = codeGen(ast);
    // console.log(JSON.stringify(ast, null, 2));
    return js;
}


// CODE RUNNER 
function runner(jsCode) {
    return eval(jsCode);
}

module.exports = { compile,runner };