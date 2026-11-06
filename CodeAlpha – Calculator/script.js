
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

const angleToggle = document.getElementById("angleToggle");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

let expression = "";
let justCalculated = false;
let isDegree = true;
let history = [];

// Allowed mathematical functions
const functions = {
    sin: x => Math.sin(isDegree ? x * Math.PI / 180 : x),
    cos: x => Math.cos(isDegree ? x * Math.PI / 180 : x),
    tan: x => {
        const angle = isDegree ? x * Math.PI / 180 : x;
        if (Math.abs(Math.cos(angle)) < 1e-12) {
            throw new Error("Undefined");
        }
        return Math.tan(angle);
    },
    sqrt: Math.sqrt,
    log: Math.log10,
    ln: Math.log,
    abs: Math.abs
};

// Safe mathematical expression parser
function calculateMath(input) {
    const tokens = input.match(
        /(?:\d+\.?\d*|\.\d+)|[a-zA-Z]+|[+\-*/%^()] /g
    );

    // Tokenizer (spaces are ignored)
    const parts = [];
    const regex = /\s*(\d+\.?\d*|\.\d+|[a-zA-Z]+|[+\-*/%^()])\s*/gy;

    let position = 0;

    while (position < input.length) {
        regex.lastIndex = position;
        const match = regex.exec(input);

        if (!match) {
            throw new Error("Invalid input");
        }

        parts.push(match[1]);
        position = regex.lastIndex;
    }

    if (!parts.length) throw new Error("Empty");

    // Add implicit multiplication: 2pi, 2(3), (2)(3)
    const expanded = [];

    for (let i = 0; i < parts.length; i++) {
        const current = parts[i];
        const previous = parts[i - 1];

        if (previous) {
            const previousEndsValue =
                !isNaN(Number(previous)) ||
                previous === ")" ||
                previous.toLowerCase() === "pi" ||
                previous.toLowerCase() === "e";

            const currentStartsValue =
                current === "(" ||
                current.toLowerCase() === "pi" ||
                current.toLowerCase() === "e" ||
                Object.hasOwn(functions, current.toLowerCase());

            if (previousEndsValue && currentStartsValue) {
                expanded.push("*");
            }
        }

        expanded.push(current);
    }

    let index = 0;

    function expressionParser() {
        let value = term();

        while (index < expanded.length) {
            const op = expanded[index];

            if (op === "+" || op === "-") {
                index++;
                const right = term();

                value = op === "+" ? value + right : value - right;
            } else {
                break;
            }
        }

        return value;
    }

    function term() {
        let value = unary();

        while (index < expanded.length) {
            const op = expanded[index];

            if (op === "*" || op === "/" || op === "%") {
                index++;
                const right = unary();

                if ((op === "/" || op === "%") && right === 0) {
                    throw new Error("Cannot divide by zero");
                }

                if (op === "*") value *= right;
                if (op === "/") value /= right;
                if (op === "%") value %= right;

            } else {
                break;
            }
        }

        return value;
    }

    function unary() {
        if (expanded[index] === "+") {
            index++;
            return unary();
        }

        if (expanded[index] === "-") {
            index++;
            return -unary();
        }

        return power();
    }

    function power() {
        let value = postfix();

        if (expanded[index] === "^") {
            index++;
            value = Math.pow(value, unary());
        }

        return value;
    }

    function postfix() {
        let value = primary();

        while (expanded[index] === "%") {
            index++;
            value /= 100;
        }

        return value;
    }

    function primary() {
        const token = expanded[index];

        if (token === "(") {
            index++;
            const value = expressionParser();

            if (expanded[index] !== ")") {
                throw new Error("Missing bracket");
            }

            index++;
            return value;
        }

        if (!isNaN(Number(token)) && token !== undefined) {
            index++;
            return Number(token);
        }

        if (typeof token === "string") {
            const name = token.toLowerCase();

            if (name === "pi") {
                index++;
                return Math.PI;
            }

            if (name === "e") {
                index++;
                return Math.E;
            }

            if (Object.hasOwn(functions, name)) {
                index++;

                if (expanded[index] !== "(") {
                    throw new Error("Missing function bracket");
                }

                index++;
                const argument = expressionParser();

                if (expanded[index] !== ")") {
                    throw new Error("Missing bracket");
                }

                index++;

                if (
                    (name === "sqrt" || name === "log" || name === "ln") &&
                    argument <= 0
                ) {
                    if (name === "sqrt" && argument === 0) return 0;
                    throw new Error("Invalid input");
                }

                return functions[name](argument);
            }
        }

        throw new Error("Invalid expression");
    }

    const answer = expressionParser();

    if (index !== expanded.length || !Number.isFinite(answer)) {
        throw new Error("Invalid calculation");
    }

    return Number(answer.toPrecision(12));
}

// Format result
function formatNumber(number) {
    return Number(number.toPrecision(12)).toString();
}

// Update Display
function updateDisplay() {
    expressionDisplay.textContent = expression || "0";

    if (!expression) {
        resultDisplay.textContent = "0";
        return;
    }

    try {
        const answer = calculateMath(expression);
        resultDisplay.textContent = formatNumber(answer);
    } catch {
        resultDisplay.textContent = " ";
    }
}

// Add Input
function addInput(value) {
    const isOperator = ["+", "-", "*", "/", "^", "%"].includes(value);

    if (justCalculated && !isOperator && value !== ")") {
        expression = "";
    }

    justCalculated = false;

    if (expression.length > 100) return;

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/^()%]/).pop();

        if (currentNumber.includes(".")) return;
    }

    expression += value;
    updateDisplay();
}

// Clear Everything
function clearCalculator() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

// Delete Last Character
function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

// Calculate Final Result
function calculateResult() {
    if (!expression) return;

    try {
        const originalExpression = expression;
        const answer = calculateMath(expression);
        const formatted = formatNumber(answer);

        history.unshift({
            expression: originalExpression,
            result: formatted
        });

        renderHistory();

        expression = formatted;
        expressionDisplay.textContent = originalExpression;
        resultDisplay.textContent = formatted;

        justCalculated = true;

    } catch {
        resultDisplay.textContent = "Error";
        justCalculated = false;
    }
}

// Button Click Events
document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        addInput(button.dataset.value);
    });
});

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {

        const action = button.dataset.action;

        if (action === "clear") clearCalculator();
        if (action === "delete") deleteLast();
        if (action === "calculate") calculateResult();

    });
});

// Degree / Radian Toggle
angleToggle.addEventListener("click", () => {
    isDegree = !isDegree;

    angleToggle.textContent = isDegree ? "DEG" : "RAD";

    updateDisplay();
});

// Keyboard Support
document.addEventListener("keydown", event => {

    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (/^[0-9.]$/.test(event.key)) {
        addInput(event.key);
    }

    if (["+", "-", "*", "/", "^", "%", "(", ")"].includes(event.key)) {
        addInput(event.key);
    }

    if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculateResult();
    }

    if (event.key === "Backspace") {
        deleteLast();
    }

    if (event.key === "Escape") {
        clearCalculator();
    }

});

// History Rendering
function renderHistory() {

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">No calculations yet.</p>';
        return;
    }

    historyList.innerHTML = "";

    history.forEach((item, index) => {

        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const expressionText = document.createElement("p");
        expressionText.textContent = item.expression;

        const resultText = document.createElement("h4");
        resultText.textContent = "= " + item.result;

        historyItem.append(expressionText, resultText);

        historyItem.addEventListener("click", () => {
            expression = item.result;
            justCalculated = true;
            updateDisplay();
            historyPanel.classList.remove("active");
        });

        historyList.appendChild(historyItem);
    });
}

// Open History
document.getElementById("historyToggle").addEventListener("click", () => {
    historyPanel.classList.add("active");
});

// Close History
document.getElementById("closeHistory").addEventListener("click", () => {
    historyPanel.classList.remove("active");
});

// Clear History
document.getElementById("clearHistory").addEventListener("click", () => {
    history = [];
    renderHistory();
});

// Initial Display
updateDisplay();
renderHistory();
