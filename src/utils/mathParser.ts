/**
 * Safe Mathematical Expression Evaluator (Recursive Descent Parser).
 * Evaluates expressions strictly without using `eval` or `Function`.
 */

export function evaluateMathExpression(expr: string): number {
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, `${Math.PI}`)
    .replace(/e/g, `${Math.E}`)
    .trim();

  let pos = 0;

  function peek(): string {
    while (pos < sanitized.length && sanitized[pos] === ' ') pos++;
    return pos < sanitized.length ? sanitized[pos] : '';
  }

  function get(): string {
    const ch = peek();
    pos++;
    return ch;
  }

  function parseExpression(): number {
    let result = parseTerm();
    while (true) {
      const op = peek();
      if (op === '+') {
        get();
        result += parseTerm();
      } else if (op === '-') {
        get();
        result -= parseTerm();
      } else {
        break;
      }
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (true) {
      const op = peek();
      if (op === '*') {
        get();
        result *= parseFactor();
      } else if (op === '/') {
        get();
        const divisor = parseFactor();
        if (divisor === 0) throw new Error('Division by zero');
        result /= divisor;
      } else if (op === '%') {
        get();
        result = result * 0.01;
      } else {
        break;
      }
    }
    return result;
  }

  function parseFactor(): number {
    let result = parseBase();
    while (peek() === '^') {
      get();
      result = Math.pow(result, parseFactor());
    }
    while (peek() === '!') {
      get();
      result = factorial(result);
    }
    return result;
  }

  function factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function parseBase(): number {
    const ch = peek();

    // Unary plus/minus
    if (ch === '+') {
      get();
      return parseBase();
    }
    if (ch === '-') {
      get();
      return -parseBase();
    }

    // Parentheses
    if (ch === '(') {
      get();
      const val = parseExpression();
      if (get() !== ')') throw new Error("Missing closing ')'");
      return val;
    }

    // Named functions: sin, cos, tan, sqrt, log, ln
    const remaining = sanitized.slice(pos);
    const funcMatch = remaining.match(/^(sin|cos|tan|sqrt|log|ln|abs)\b/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toLowerCase();
      pos += funcName.length;
      if (peek() !== '(') throw new Error(`Expected '(' after ${funcName}`);
      get();
      const arg = parseExpression();
      if (get() !== ')') throw new Error(`Missing closing ')' after ${funcName}`);

      switch (funcName) {
        case 'sin':
          return Math.sin((arg * Math.PI) / 180); // Degree mode standard
        case 'cos':
          return Math.cos((arg * Math.PI) / 180);
        case 'tan': {
          const rad = (arg * Math.PI) / 180;
          if (Math.abs(Math.cos(rad)) < 1e-12) throw new Error('Tangent undefined');
          return Math.tan(rad);
        }
        case 'sqrt':
          if (arg < 0) throw new Error('Square root of negative number');
          return Math.sqrt(arg);
        case 'log':
          if (arg <= 0) throw new Error('Logarithm of non-positive number');
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) throw new Error('Natural log of non-positive number');
          return Math.log(arg);
        case 'abs':
          return Math.abs(arg);
      }
    }

    // Numbers
    const numMatch = remaining.match(/^(\d+(\.\d+)?)/);
    if (numMatch) {
      pos += numMatch[1].length;
      return parseFloat(numMatch[1]);
    }

    throw new Error(`Unexpected character '${ch}'`);
  }

  const val = parseExpression();
  if (pos < sanitized.length) {
    throw new Error(`Unexpected character '${sanitized[pos]}'`);
  }
  return val;
}
