
import Lexer from './lexer'
import Token, { TokenType } from './token'
import AST from './ast'

const tt = TokenType

class Parser {
  lexer: Lexer
  currentToken: Token
  get currentType (): TokenType {
    return this.currentToken.type
  }

  constructor (text: string = '') {
    this.lexer = new Lexer(text)
    this.currentToken = this.lexer.getNextToken()
  }

  eat (tokType: TokenType) {
    if (this.currentType === tokType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      throw `Unexpected token: ${this.currentToken.type}. Expected ${tokType}`
    }
  }

  statementTerminator () {
    // const blockTerminator: TokenType[] = [tt.NULL, tt.RCUR, tt.RPAR]
    // if (this.currentToken.type === tt.SEMI) {
    this.eat(tt.SEMI)
    // }
    // else if (blockTerminator.indexOf(this.currentType) === -1) {
    //   do {
    //     this.eat(tt.NL)
    //   } while (this.currentType === tt.NL)
    // }
  }

  program (): AST {
    let result = this.block()

    if (this.currentType !== tt.NULL) {
      throw `Unexpected token '${this.currentType}'.`
    }

    return result
  }

  block (): AST {
    return { kind: 'Block', statements: this.statementList() }
  }

  statementList (): AST[] {
    let result: AST[] = []

    if (this.currentType === tt.RCUR) {
      return result
    }

    while (this.currentType !== tt.NULL && this.currentToken.type !== tt.RCUR) {
      result.push(this.statement())
    }

    return result
  }

  statement (withterm: boolean = true): AST {
    let ex: AST
    switch (this.currentToken.type) {
      case tt.LCUR:
        this.eat(tt.LCUR)
        ex = this.block()
        this.eat(tt.RCUR)
        break
      case tt.IF:
        this.eat(tt.IF)
        ex = this.ifstatement()
        break
      case tt.CLASS:
        this.eat(tt.CLASS)
        ex = this.classstatement()
      // case tt.INIT:
      //     this.eat(tt.INIT)
      //     ex = this.cons()
      case tt.FUNC:
        this.eat(tt.FUNC)
        ex = this.func()
        break
      case tt.RET:
        this.eat(tt.RET)
        let val = this.ternaryOp()
        ex = { kind: 'Return', val: val }
        break
      case tt.FOR:
        // debugger
        this.eat(tt.FOR)
        ex = this.forstatement()
        break
      case tt.WHILE:
        this.eat(tt.WHILE)
        ex = this.whilestatement()
        break
      case tt.LOOP:
        this.eat(tt.LOOP)
        ex = this.loopstatement()
        break
      case tt.BREAK:
        this.eat(tt.BREAK)
        ex = { kind: 'Break' }
        if (withterm) {
          this.statementTerminator()
        }
        break
      case tt.STATIC:
        this.eat(tt.STATIC)
        ex = { kind: 'StaticStatement', statement: this.statement(false) }
      case tt.NULL:
      case tt.RCUR:
      case tt.RPAR:
        return { kind: 'NoOp' }
      default:
        ex = this.ternaryOp()
        if (withterm) {
          this.statementTerminator()
        }
    }

    return ex
  }

  classstatement (): AST {
    let name = this.currentToken
    this.eat(tt.ID)

    var inherits: Token = null

    if (this.currentToken.type === tt.COLON) {
      this.eat(tt.COLON)
      inherits = this.currentToken
      this.eat(tt.ID)
    }

    this.eat(tt.LCUR)
    let body = this.classBody()
    this.eat(tt.RCUR)

    return { kind: 'Class', name: name, inherits: inherits, body: body }
  }

  classBody (): AST {
    return { kind: 'ClassBody', statements: this.statementList() }
  }

  declaration (token: Token): AST {
    const varName = this.currentToken
    this.eat(tt.ID)

    let assignment: AST

    if (this.currentType === tt.ASS) {
      this.eat(tt.ASS)
      assignment = this.ternaryOp()
    }

    return {
      kind: 'Declaration',
      varType: token,
      token: varName,
      initial: assignment
    }
  }

  whilestatement (): AST {
    const comp = this.ternaryOp()

    let body: AST
    if (this.currentToken.type === tt.LCUR) {
      this.eat(tt.LCUR)
      body = this.block()
      this.eat(tt.RCUR)
    } else {
      body = this.statement()
    }

    return { kind: 'While', cond: comp, body: body }
  }

  forstatement (): AST {
    this.eat(tt.LPAR)
    let initializer = this.statement()

    let compar = this.ternaryOp()
    this.statementTerminator()
    let inc = this.statement(false)

    this.eat(tt.RPAR)

    let body: AST

    if (this.currentToken.type === tt.LCUR) {
      this.eat(tt.LCUR)
      body = this.block()
      this.eat(tt.RCUR)
    } else {
      body = this.statement()
    }

    return { kind: 'For', ini: initializer, cond: compar, incr: inc, body: body }
  }

  ifstatement (): AST {
    const exp = this.ternaryOp()

    if (this.currentToken.type === tt.LCUR) {
      this.eat(tt.LCUR)

      const trueBlock = this.block()
      this.eat(tt.RCUR)

      if (this.currentType === tt.ELSE) {
        this.eat(tt.ELSE)

        let elseBlock: AST

        if (this.currentToken.type === tt.LCUR) {
          this.eat(tt.LCUR)
          elseBlock = this.block()
          this.eat(tt.RCUR)
        } else {
          this.eat(tt.IF)
          elseBlock = this.ifstatement()
        }

        return { kind: 'If', expression: exp, trueb: trueBlock, falseb: elseBlock }
      }
      return { kind: 'If', expression: exp, trueb: trueBlock, falseb: null }
    } else {
      let trueSta = this.statement()

      return { kind: 'If', expression: exp, trueb: trueSta, falseb: null }
    }
  }

  func (): AST {
    let name = this.currentToken
    this.eat(tt.ID)

    this.eat(tt.LPAR)
    let params = this.parameters()
    this.eat(tt.RPAR)

    var retType: Token = null
    if (this.currentToken.type === tt.COLON) {
      this.eat(tt.COLON)
      retType = this.currentToken

      this.eat(tt.ID)
    }

    this.eat(tt.LCUR)
    let bl = this.funcBody()
    this.eat(tt.RCUR)

    return { kind: 'FuncDecl', token: name, params: params, retType: retType, body: bl }
  }

  parameters (): AST[] {
    let params: AST[] = []

    if (this.currentToken.type !== tt.RPAR) {
      let typeToken = this.currentToken
      this.eat(tt.ID)
      params.push(this.declaration(typeToken))

      while (this.currentType !== tt.RPAR) {
        this.eat(tt.COMMA)
        const typeToken = this.currentToken
        this.eat(tt.ID)
        params.push(this.declaration(typeToken))
      }
    }
    return params
  }

  funcBody (): AST {
    return { kind: 'FuncBody', statements: this.statementList() }
  }

  loopstatement (): AST {
    let body: AST
    if (this.currentToken.type === tt.LCUR) {
      this.eat(tt.LCUR)
      body = this.block()
      this.eat(tt.RCUR)
    } else {
      body = this.statement()
    }

    return { kind: 'Loop', body: body }
  }

  ternaryOp (): AST {
    let comp = this.comparison()

    while (this.currentToken.type === tt.QUEST) {
      this.eat(tt.QUEST)
      const trueSection = this.comparison()

      this.eat(tt.COLON)
      const falseSection = this.comparison()

      comp = { kind: 'TernaryOp', cond: comp, trueb: trueSection, falseb: falseSection }
    }

    return comp
  }

  comparison (): AST {
    let ex = this.expression()

    const compTypes = [tt.EQU, tt.NEQ, tt.GT, tt.LT, tt.LET, tt.GET]

    while (compTypes.indexOf(this.currentToken.type) !== -1) {
      let cToken = this.currentToken
      this.eat(this.currentToken.type)
      ex = { kind: 'BinOp', op: cToken, left: ex, right: this.expression() }
    }

    return ex
  }

  expression (): AST {
    let node = this.term()

    while ([tt.PLUS, tt.MINUS].indexOf(this.currentToken.type) !== -1) {
      const opToken = this.currentToken
      if (this.currentToken.type === tt.PLUS) {
        this.eat(tt.PLUS)
      } else {
        this.eat(tt.MINUS)
      }

      node = {
        kind: 'BinOp',
        left: node,
        op: opToken,
        right: this.term()
      }
    }
    return node
  }

  term (): AST {
    let node = this.prod()

    while ([tt.MUL, tt.DIV].indexOf(this.currentToken.type) !== -1) {
      const opToken = this.currentToken
      if (this.currentToken.type === tt.MUL) {
        this.eat(tt.MUL)
      } else {
        this.eat(tt.DIV)
      }

      node = {
        kind: 'BinOp',
        left: node,
        op: opToken,
        right: this.prod()
      }
    }

    return node
  }

  prod (): AST {
    let node = this.postfix()

    while (tt.POW === this.currentToken.type) {
      const opToken = this.currentToken
      this.eat(tt.POW)

      node = {
        kind: 'BinOp',
        left: node,
        op: opToken,
        right: this.postfix()
      }
    }

    return node
  }

  postfix (): AST {
    let node = this.factor()
    const postFixOp = [
      tt.PLUSP, tt.MINUSP,
      tt.PLUSE, tt.MINUSE, tt.MULE, tt.DIVE,
      tt.DOT, tt.DCOLON,
      tt.LPAR,
      tt.ASS
    ]

    while (postFixOp.indexOf(this.currentToken.type) !== -1) {
      switch (this.currentType) {
        case tt.PLUSP:
        case tt.MINUSP:
          let addOP: Token
          if (this.currentType === tt.PLUSP) {
            addOP = new Token(tt.PLUS, '+')
            this.eat(tt.PLUSP)
          } else {
            addOP = new Token(tt.MINUS, '-')
            this.eat(tt.MINUSP)
          }

          let one = new Token(tt.INT, '1')
          let addOperation: AST = { kind: 'BinOp', op: addOP, left: node, right: { kind: 'Int', token: one } }
          node = { kind: 'Assignment', token: node, right: addOperation }
          break
        case tt.PLUSE:
        case tt.MINUSE:
        case tt.MULE:
        case tt.DIVE:
          let termOP: Token
          switch (this.currentType) {
            case tt.PLUSE:
              termOP = new Token(tt.PLUS, '+')
              this.eat(tt.PLUSE)
              break
            case tt.MINUSE:
              termOP = new Token(tt.MINUS, '-')
              this.eat(tt.MINUSE)
              break
            case tt.MULE:
              termOP = new Token(tt.MUL, '*')
              this.eat(tt.MULE)
              break
            default:
              termOP = new Token(tt.DIV, '/')
              this.eat(tt.DIVE)
              break
          }

          let operation: AST = { kind: 'BinOp', op: termOP, left: node, right: this.ternaryOp() }
          node = { kind: 'Assignment', token: node, right: operation }
          break
        case tt.DOT:
          this.eat(tt.DOT)
          let memberV = this.currentToken
          this.eat(tt.ID)
          node = { kind: 'MemberVar', inst: node, name: memberV }
          break
        case tt.DCOLON:
          this.eat(tt.DCOLON)
          let member = this.currentToken
          this.eat(tt.ID)
          node = { kind: 'StaticVar', inst: node, name: member }
          break
        case tt.LPAR:
          this.eat(tt.LPAR)

          var argList: AST[] = []

          while (this.currentToken.type !== tt.RPAR) {
            argList.push(this.ternaryOp())

            // @ts-ignore
            if (this.currentToken.type !== tt.RPAR) {
              this.eat(tt.COMMA)
            }
          }

          this.eat(tt.RPAR)
          var name: Token
          switch (node.kind) {
            case 'Variable':
              name = node.token
            default:
              break
          }
          node = { kind: 'FuncCall', fun: node, fuName: name, args: argList }
          break
        case tt.ASS:
          this.eat(tt.ASS)
          node = { kind: 'Assignment', token: node, right: this.ternaryOp() }
          break
        default:
          break
      }
    }

    return node
  }

  funcexpression (): AST {
    this.eat(tt.LPAR)
    let params = this.parameters()
    this.eat(tt.RPAR)

    this.eat(tt.ARROW)

    var body: AST
    if (this.currentToken.type === tt.LCUR) {
      this.eat(tt.LCUR)
      body = this.funcBody()
      this.eat(tt.RCUR)
    } else {
      body = this.ternaryOp()
    }

    return { kind: 'FuncExpression', params: params, retType: null, body: body }
  }

  factor (): AST {
    switch (this.currentToken.type) {
      case tt.REAL:
        const realTok = this.currentToken
        this.eat(tt.REAL)
        return { kind: 'Double', token: realTok }
      case tt.INT:
        const intTok = this.currentToken
        this.eat(tt.INT)
        return { kind: 'Int', token: intTok }
      case tt.STR:
        const strTok = this.currentToken
        this.eat(tt.STR)
        return { kind: 'Str', token: strTok }
      case tt.BOOL:
        const boolTok = this.currentToken
        this.eat(tt.BOOL)
        return { kind: 'Bool', token: boolTok }
      case tt.NOT:
        this.eat(tt.NOT)
        const c = this.factor()
        const notComp: AST = {
          kind: 'BinOp',
          op: new Token(tt.EQU, '==='),
          left: c,
          right: {
            kind: 'Bool',
            token: new Token(tt.BOOL, 'false')
          }
        }

        return notComp
      case tt.LPAR:
        this.eat(tt.LPAR)
        const exp = this.ternaryOp()
        this.eat(tt.RPAR)
        return exp
      case tt.PLUS:
      case tt.MINUS:
        const op = this.currentToken
        this.eat(op.type)
        return { kind: 'UnaryOp', op: op, right: this.factor() }
      // case tt.NEW:
      //         this.eat(tt.NEW)
      //         return this.newInitializer()
      case tt.ID:
        let idToken = this.currentToken
        this.eat(tt.ID)

        switch (this.currentToken.type) {
          case tt.ID:
            return this.declaration(idToken)
          default:
            break
        }

        return { kind: 'Variable', token: idToken }
      case 'FUNC':
        this.eat(tt.FUNC)
        return this.funcexpression()
      default:
        return { kind: 'NoOp' }
    }
    // if(this.currentToken.type === tt.INT){
    //     const intTok = this.currentToken
    //     this.eat(tt.INT)
    //     return {kind: 'Int', token: intTok}
    // } else if (this.currentToken.type === tt.LPAR){
    //     this.eat(tt.LPAR)
    //     let expr = this.expression()
    //     this.eat(tt.RPAR)
    //     return expr
    // } else {
    //     throw 'Expected a factor.'
    // }
  }

  setText (text: string) {
    this.lexer.text = text
    this.lexer.reset()

    this.currentToken = this.lexer.getNextToken()
  }
}

export default Parser
