import Token, { TokenType } from './token'

const tt = TokenType

class Lexer {
  text: string
  private _currentPos: number
  private currentChar: string
  private currentLine: number
  reservedKeywords: { [name: string]: Token } = {
    'true': new Token(tt.BOOL, 'true'),
    'false': new Token(tt.BOOL, 'false'),
    'if': new Token(tt.IF, 'if'),
    'else': new Token(tt.ELSE, 'else'),
    'func': new Token(tt.FUNC, 'func'),
    'return': new Token(tt.RET, 'return'),
    'for': new Token(tt.FOR, 'for'),
    'while': new Token(tt.WHILE, 'while'),
    'loop': new Token(tt.LOOP, 'loop'),
    'break': new Token(tt.BREAK, 'break'),
    'class': new Token(tt.CLASS, 'class'),
    'new': new Token(tt.NEW, 'new'),
    'static': new Token(tt.STATIC, 'static'),
    'init': new Token(tt.INIT, 'init')
  }

  set CurrentPos (val: number) {
    this._currentPos = val
  }

  get CurrentPos (): number {
    return this._currentPos
  }

  get CurrentChar (): string {
    return this.currentChar
  }

  constructor (text: string) {
    this.text = text
    this._currentPos = -1
    this.currentLine = 0
    this.advance()
  }

  advance () {
    this.CurrentPos++

    if (this.CurrentPos >= this.text.length) {
      this.currentChar = undefined
    } else {
      this.currentChar = this.text[this.CurrentPos]
    }
  }

  isWhitespace (): boolean {
    // eslint-disable-next-line
    return this.currentChar && this.currentChar.match(/^\s*$/) != undefined
  }

  isNewline (): boolean {
    // eslint-disable-next-line
    return this.currentChar && this.currentChar.match(/^\r\n|\r|\n/) != undefined
  }

  ignoreWhitespace () {
    while (this.currentChar && this.isWhitespace()) {
      this.advance()
    }
  }

  ignoreComment () {
    while (this.currentChar || this.currentChar) {
      this.advance()
    }
  }

  isAlpha (): boolean {
    // eslint-disable-next-line
    return this.currentChar.match(/^[\w|_]$/) != undefined
  }

  id (): Token {
    var result = ''

    do {
      result += this.currentChar
      this.advance()
    } while (!this.currentChar ? false
      : (this.isAlpha() ||
          this.isInteger()))

    const foundReserved = this.reservedKeywords[result]
    if (foundReserved) {
      return foundReserved
    }

    return new Token(tt.ID, result)
  }

  string (): string {
    const delimiter = this.CurrentChar
    this.advance()
    let result = ''

    while (this.currentChar && this.currentChar !== delimiter) {
      result += this.currentChar
      this.advance()
    }
    this.advance()

    return result
  }

  isInteger (): boolean {
    // eslint-disable-next-line
    return this.currentChar && this.currentChar.match(/^\d*$/) != undefined
  }

  integer () {
    let result = ''
    while (this.currentChar && this.isInteger()) {
      result += this.currentChar
      this.advance()
    }

    return result
  }

  number (): Token {
    let result = ''

    let foundPoint = false

    do {
      if (this.currentChar === '.') {
        foundPoint = true
      }

      result += this.currentChar
      this.advance()
    } while (this.isInteger() ||
      (this.currentChar === '.' && !foundPoint))

    if (foundPoint) {
      return new Token(tt.REAL, result)
    } else {
      return new Token(tt.INT, result)
    }
  }

  getNextToken (): Token {
    if (this.isWhitespace() || this.isNewline()) {
      this.advance()
      this.ignoreWhitespace()
    }

    if (this.currentChar && this.currentChar === '#') {
      this.advance()
      this.ignoreComment()
    }

    if (this.currentChar === undefined) {
      return new Token(tt.NULL, '')
    }

    if (this.isInteger()) {
      return this.number()
    } else if (this.isAlpha()) {
      return this.id()
    }

    switch (this.currentChar) {
      case '"':
      case '\'':
        return new Token(tt.STR, this.string())
      case '+':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.PLUSE, '+=')
        } else if (this.CurrentChar === '+') {
          this.advance()
          return new Token(tt.PLUSP, '++')
        }

        return new Token(tt.PLUS, '+')
      case '-':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.MINUSE, '-=')
        } else if (this.CurrentChar === '-') {
          this.advance()
          return new Token(tt.MINUSP, '--')
        } else if (this.CurrentChar === '>') {
          this.advance()
          return new Token(tt.ARROW, '->')
        }
        return new Token(tt.MINUS, '-')
      case '*':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.MULE, '*=')
        }
        return new Token(tt.MUL, '*')
      case '^':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.POWE, '^=')
        }
        return new Token(tt.POW, '^')
      case '!':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.NEQ, '!=')
        }

        return new Token(tt.NOT, '!')
      case '<':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.LET, '<=')
        }

        return new Token(tt.LT, '<')
      case '>':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.GET, '<=')
        }

        return new Token(tt.GT, '<')
      case '/':
        this.advance()
        return new Token(tt.DIV, '/')
      case '(':
        this.advance()
        return new Token(tt.LPAR, '(')
      case ')':
        this.advance()
        return new Token(tt.RPAR, ')')
      case '{':
        this.advance()
        return new Token(tt.LCUR, '{')
      case '}':
        this.advance()
        return new Token(tt.RCUR, '}')
      case ',':
        this.advance()
        return new Token(tt.COMMA, ',')
      case ';':
        this.advance()
        return new Token(tt.SEMI, ';')
      case ':':
        this.advance()
        if (this.CurrentChar === ':') {
          this.advance()
          return new Token(tt.DCOLON, '::')
        }
        return new Token(tt.COLON, ':')
      case '.':
        this.advance()
        return new Token(tt.DOT, '.')
      case '?':
        this.advance()
        return new Token(tt.QUEST, '?')
      case '=':
        this.advance()
        if (this.CurrentChar === '=') {
          this.advance()
          return new Token(tt.EQU, '==')
        }
        return new Token(tt.ASS, '=')
      case '&':
        this.advance()
        if (this.CurrentChar === '&') {
          this.advance()
          return new Token(tt.AND, '&&')
        }
        break
      case '|':
        this.advance()
        if (this.CurrentChar === '|') {
          this.advance()
          return new Token(tt.OR, '||')
        }
        break
      case '\n':
        this.advance()
        this.currentLine += 1

        return new Token(tt.NL, '\n')
      default:
        break
    }

    if (this.isInteger()) {
      return new Token(tt.INT, this.integer())
    } else if (this.currentChar === '+') {
      this.advance()
      return new Token(tt.PLUS, '+')
    } else if (this.currentChar === '-') {
      this.advance()
      return new Token(tt.MINUS, '-')
    } else if (this.currentChar === '*') {
      this.advance()
      return new Token(tt.MUL, '*')
    } else if (this.currentChar === '/') {
      this.advance()
      return new Token(tt.DIV, '/')
    } else if (this.currentChar === '(') {
      this.advance()
      return new Token(tt.LPAR, '(')
    } else if (this.currentChar === ')') {
      this.advance()
      return new Token(tt.RPAR, ')')
    }

    throw 'Syntax error. Unkwown character: "' + this.currentChar + '"'
  }

  reset () {
    this._currentPos = -1
    this.advance()
  }
}

export default Lexer
