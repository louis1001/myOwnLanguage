
import Parser from './parser'
import Interpreter from './interpreter'

const int = new Interpreter()

function setupConsole (consRepl: any) {
  const currentConsole = window.console.log

  window.console.log = (...args) => {
    consRepl(...args)
    currentConsole(...args)
  }
}

function main () {
  addEventListener('load', () => {
    let bRun = document.querySelector('#run-button')
    if (bRun) {
      bRun.addEventListener('click', () => {
        runCode()
      })
    }
  })
}

function parseHTML (code: string): string {
  const par = new Parser(code)

  const ast = par.program()

  const result = JSON.stringify(ast, null, 4)

  return result
}

function runCode () {
  let inp = <HTMLInputElement>document.querySelector('#code-input')
  let code = inp.value
  let result = parseHTML(code)

  let resultDiv = document.querySelector('#result-code')
  resultDiv && (resultDiv.innerHTML = result)
}

function evalCode (code: string): string {
  const evaluated = int.interpret(code)

  return evaluated
}

export default main
export {
  evalCode,
  setupConsole
}
