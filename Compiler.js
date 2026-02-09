function Tokenise(program) {
    let jumpstack = []
    let tokens = []

    for (i = 0; i < program.length; i++) {
        let char = program[i]

        // Skip non-command chars
        if (['<', '>', '+', '-', ',', '.', '[', ']'].indexOf(char) === -1) {
            continue
        }

        if (char === '[') {
            tokens.push({type: char, value: 0})
            jumpstack.push(tokens.length - 1)
            continue
        } else if (char === ']') {
            if (jumpstack.length === 0) {
                return "Unmatched ']' at character " + i
            }

            let jumpindex = jumpstack.pop()
            tokens.push({type: char, value: jumpindex - tokens.length + 1}) // tokens.length > jumpindex
            tokens[jumpindex].value = tokens.length - jumpindex
            continue
        }

        if (tokens.length > 0 && char === tokens.at(-1).type && ['+', '-', '<', '>'].indexOf(char) !== -1) {
            tokens[tokens.length - 1].value++
        } else {
            tokens.push({type: char, value: 1})
        }
    }
    if (jumpstack.length !== 0) {
        return "Unmatched '['"
    }
    return tokens
}

function Simulate(tokens) {
    let stack = [0]
    let data_pointer = 0
    let instruction_pointer = 0
    let output_buffer = ""

    let iterations = 0
    while (true) {
        if (instruction_pointer >= tokens.length) break
        if (instruction_pointer < 0) return [stack.length, iterations, output_buffer, "Instruction pointer out of bounds"]

        let inst = tokens[instruction_pointer]
        // console.log("E " + inst.type, "I " + instruction_pointer, "V " + inst.value, "DP " + data_pointer, "S", stack)
        if (inst.type === '+'){stack[data_pointer] += inst.value}
        if (inst.type === '-'){stack[data_pointer] -= inst.value}
        if (inst.type === '>'){
            data_pointer += inst.value;
            while (stack.length <= data_pointer) stack.push(0)
        }
        if (inst.type === '<'){
            data_pointer -= inst.value;
            if (data_pointer < 0) return [stack.length, iterations, output_buffer, "Data pointer out of bounds"]
        }
        if (inst.type === '[' && stack[data_pointer] === 0) {instruction_pointer += inst.value; continue}
        if (inst.type === ']' && stack[data_pointer] !== 0) {instruction_pointer += inst.value; continue}

        if (inst.type === '.') {
            // if ()
            output_buffer += String.fromCharCode(stack[data_pointer])
        }

        instruction_pointer++
        iterations++

        if (iterations>1000000) return [stack.length, iterations, output_buffer, "Iteration limit reached, simulation halted"]
    }

    return [stack.length, iterations, output_buffer, ""]
}
