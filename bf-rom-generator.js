function simulate() {
    clearSuccess()
    compilerOutput.innerText = ""

    const tokens = compile()
    if (tokens.length === 0) return

    let result = Simulate(tokens)
    const message = "Iterations: " + result[1] + ", Max Stack Length: " + result[0]
    if (result[3] !== "") {
        setError(message + ". Error: " + result[3])
    } else {
        compilerOutput.textContent = result[2]
        setSuccess(message)
    }
}

function programRom() {
    const tokens = compile()
    if (tokens.length === 0) return

    displayTokens(tokens)
    blueprintOutput.innerText = Encode(TokensToBlueprint(tokens))
}

function inputRom() {
    clearError()
    let values = editor.value.split(",")
    if (values.length === 0) return

    let inputs = []
    for (let i in values) {
        const value = values[i]
        let parsed = parseInt(value, 10)

        if (value.length !== 1 && isNaN(parsed)) {
            setError("Invalid input value at value index " + i)
            return
        }

        inputs.push({type: "v", value: isNaN(parsed) ? value.charCodeAt(0) : parsed})
    }

    displayTokens(inputs)
    blueprintOutput.innerText = Encode(InputsToBlueprint(inputs))
}


function compile() {
    clearError()
    let tokens = Tokenise(editor.value)
    if (typeof tokens === "string") {
        setError(tokens)
        return []
    }
    return tokens
}

function displayTokens(tokens) {
    let output = ""
    for (let i in tokens) {
        output += i + ": " + JSON.stringify(tokens[i]) + "\n"
    }
    compilerOutput.innerText = output
}

function setError(msg) {
    clearSuccess()
    errorBanner.textContent = msg;
    errorBanner.classList.remove("hidden");
}

function clearError() {
    errorBanner.classList.add("hidden");
}

function setSuccess(msg) {
    clearError()
    successBanner.textContent = msg;
    successBanner.classList.remove("hidden");
}
function clearSuccess() {
    successBanner.classList.add("hidden")
}
