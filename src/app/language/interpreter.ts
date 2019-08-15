import Value, { ValueTable, InstanceValue, FunctionValue, ClassValue } from './value'
import Token, { TokenType } from './token'
import Parser from './parser'
import AST from './ast'
import Symbol, { SymbolTable, BuiltinTypeSymbol, VarSymbol, TypeSymbol, FunctionType, FunctionSymbol } from './symbol'
import { compAny, sumAny, subAny, mulAny, divAny, powAny } from './interpreterFunctions/functions'

const tt = TokenType

export default class Interpreter {
  parser: Parser
  valueTable: ValueTable
  constructorParams: Value[]
  globalTable: SymbolTable
  currentScope: SymbolTable
  replScope: SymbolTable
  null: Value
  breaking: boolean = false
  returning: Value = null
  callDepth: number = 0
  MAX_CALL_DEPTH = 1000

  constructor (code: string = '') {
    this.parser = new Parser(code)

    let builtinTypes = {
      'int': new BuiltinTypeSymbol('int'),
      'double': new BuiltinTypeSymbol('double'),
      'string': new BuiltinTypeSymbol('string'),
      'bool': new BuiltinTypeSymbol('bool'),
      'pointer': new BuiltinTypeSymbol('pointer'),
      'NullType': new TypeSymbol('NullType')
    }

    this.globalTable = new SymbolTable('global', builtinTypes)
    this.currentScope = this.globalTable

    this.replScope = new SymbolTable('repl', null, this.globalTable)

    this.valueTable = new ValueTable()
    let nullVal = this.valueTable.addNewValue(
      builtinTypes['NullType'],
      'null'
    )

    this.null = nullVal

    let nullSym = new Symbol(
      'null',
      builtinTypes['NullType'],
      nullVal.address
    )

    this.globalTable.addSymbol(nullSym)
  }

  visit (node: AST): Value {
    switch (node.kind) {
      // Normal types
      case 'Double':
        return this.visitDouble(node.token)
      case 'Int':
        return this.visitInt(node.token)
      case 'Bool':
        return this.visitBool(node.token)
      case 'Str':
        return this.visitStr(node.token)

      // Operations
      case 'BinOp':
        return this.visitBinOp(node.op, node.left, node.right)
      case 'UnaryOp':
        return this.visitUnaryOp(node.op, node.right)
      case 'NoOp':
        return this.null

      // Control Flow
      case 'TernaryOp':
        return this.visitTernaryOp(node.cond, node.trueb, node.falseb)
      case 'If':
        return this.visitIf(node.expression, node.trueb, node.falseb)
      case 'For':
        return this.visitFor(node.ini, node.cond, node.incr, node.body)
      case 'While':
        return this.visitWhile(node.cond, node.body)
      case 'Loop':
        return this.visitLoop(node.body)
      case 'Break':
        this.breaking = true
        return this.null
      case 'Block':
        return this.visitBlock(node.statements)

      // Variable Handling
      case 'Declaration':
        return this.visitVarDeclaration(node.varType, node.token, node.initial)
      case 'Variable':
        return this.visitVariable(node.token)
      case 'Assignment':
        return this.visitAssignment(node.token, node.right)

      // Functions
      case 'FuncExpression':
        return this.visitFuncExpr(node.params, node.body, node.retType)
      case 'FuncDecl':
        return this.visitFuncDecl(node.token, node.params, node.body, node.retType)
      case 'FuncCall':
        return this.visitFuncCall(node.fun, node.args, node.fuName)
      case 'FuncBody':
        return this.visitFuncBody(node.statements)
      case 'Return':
        return this.visitReturn(node.val)
      // Classes
      case 'Class':
        return this.visitClass(node.name, node.body, node.inherits)
      case 'ClassBody':
        return this.visitClassBody(node.statements)
      case 'ConstructorDecl':
        return this.visitConstructorDecl(node.body, node.params)
      case 'ConstructorCall':
        return this.visitConstructorCall(node.name)
      case 'InstanceBody':
        return this.visitInstanceBody(node.statements)
      case 'ClassInitializer':
        return this.visitClassInitializer(node.name, node.params)
      case 'StaticStatement':
        return this.visit(node.statement)
      case 'MemberVar':
        return this.visitMemberVar(node.inst, node.name)
      case 'StaticVar':
        return this.visitStaticVar(node.inst, node.name)
    }
  }

  visitClass (name: Token, body: AST, inherits: Token): Value {
    throw new Error('Method not implemented.')
  }

  visitClassBody (statements: AST[]): Value {
    throw new Error('Method not implemented.')
  }

  visitConstructorDecl (body: AST, params: AST[]): Value {
    throw new Error('Method not implemented.')
  }

  visitConstructorCall (name: Token): Value {
    throw new Error('Method not implemented.')
  }

  visitInstanceBody (statements: AST[]): Value {
    throw new Error('Method not implemented.')
  }

  visitClassInitializer (name: Token, params: AST[]): Value {
    throw new Error('Method not implemented.')
  }

  visitMemberVar (inst: AST, name: Token): Value {
    throw new Error('Method not implemented.')
  }

  visitStaticVar (inst: AST, name: Token): Value {
    throw new Error('Method not implemented.')
  }

  isBoolean (val: any) {
    return typeof val === 'boolean' || (/true/i).test(val) === undefined
  }

  createLiteral (value: string, type: string): Value {
    let val: any
    switch (type) {
      case 'double':
        val = Number(value)
        break
      case 'int':
        val = Math.round(Number(value))
        break
      case 'string':
        val = value
        break
      case 'bool':
        val = (/true/i).test(value)
        break
      default:
        return this.null
    }

    if (val === null) {
      throw `Token ${value} is not a valid value for type ${type}`
    }

    let addedVal = this.valueTable.addNewValue(
      this.globalTable.findSymbol(type),
      val
    )

    return addedVal
  }

  visitBinOp (op: Token, left: AST, right: AST): Value {
    const leftVisited = this.visit(left)
    const rightVisited = this.visit(right)

    const leftVal = leftVisited.value
    const rightVal = rightVisited.value

    switch (op.type) {
      case (tt.PLUS):
        if ([leftVisited.type.name, rightVisited.type.name].indexOf('string') !== -1) {
          return this.createLiteral(`${leftVal}${rightVal}`, 'string')
        } else if (leftVisited.type === rightVisited.type) {
          return this.createLiteral(sumAny(leftVal, rightVal).toString(), leftVisited.type.name)
        } else {
          throw 'Numeric adition must be with operands of same type.'
        }
      case (tt.MINUS):
        if (leftVisited.type === rightVisited.type) {
          return this.createLiteral(subAny(leftVal, rightVal).toString(), leftVisited.type.name)
        } else {
          throw 'Numeric substraction must be with operands of same type.'
        }
      case (tt.MUL):
        if (leftVisited.type === rightVisited.type) {
          return this.createLiteral(mulAny(leftVal, rightVal).toString(), leftVisited.type.name)
        } else {
          throw 'Numeric multiplication must be with operands of same type.'
        }
      case (tt.DIV):
        if (leftVisited.type === rightVisited.type && leftVisited.type.name === 'double') {
          return this.createLiteral(divAny(leftVal, rightVal).toString(), 'double')
        } else {
          throw 'Numeric division must be with operands of same type.'
        }
      case (tt.POW):
        if (leftVisited.type === rightVisited.type) {
          return this.createLiteral(subAny(leftVal, rightVal).toString(), leftVisited.type.name)
        } else {
          throw 'The exponential operator must be used with operands of same type.'
        }
      case (tt.EQU):
        let EQ =
          compAny(leftVal, rightVal, (x, y) => x === y) ||
          leftVisited.address === rightVisited.address
        return this.createLiteral(String(EQ), 'bool')
      case (tt.NEQ):
        let NEQ =
          compAny(leftVal, rightVal, (x, y) => x !== y) &&
          leftVisited.address !== rightVisited.address
        return this.createLiteral(String(EQ), 'bool')
      case (tt.LT):
        let LT =
          (typeof leftVal !== 'string' && typeof rightVal !== 'string') &&
          compAny(leftVal, rightVal, (x, y) => x < y)
        return this.createLiteral(String(LT), 'bool')
      case (tt.GT):
        let GT =
          (typeof leftVal !== 'string' && typeof rightVal !== 'string') &&
          compAny(leftVal, rightVal, (x, y) => x > y)
        return this.createLiteral(String(GT), 'bool')
      case (tt.LET):
        let LET =
          (typeof leftVal !== 'string' && typeof rightVal !== 'string') &&
          compAny(leftVal, rightVal, (x, y) => x <= y)
        return this.createLiteral(String(LET), 'bool')
      case (tt.GET):
        let GET =
          (typeof leftVal !== 'string' && typeof rightVal !== 'string') &&
          compAny(leftVal, rightVal, (x, y) => x >= y)
        return this.createLiteral(String(GET), 'bool')
      default:
        return null
    }
  }

  visitUnaryOp (op: Token, right: AST): Value {
    const result = this.visit(right)
    switch (op.type) {
      case (tt.PLUS):
        if (Math.round(result.value) === result.value) {
          return this.createLiteral(String(result.value), 'int')
        } else {
          return this.createLiteral(String(result.value), 'double')
        }
      case (tt.MINUS):
        if (Math.round(result.value) === result.value) {
          return this.createLiteral(String(-result.value), 'int')
        } else {
          return this.createLiteral(String(-(result.value)), 'int')
        }
      case (tt.NOT):
        if (!(!result.value) === result.value) {
          return this.createLiteral(String(result.value), 'bool')
        } else {
          throw 'Expected a bool operand for operator NOT'
        }
      default:
        return this.null
    }
  }

  visitFuncExpr (params: AST[], body: AST, retType?: Token): Value {
    // eslint-disable-next-line
    let retuType = (retType == null) ? null : this.currentScope.findSymbol(retType.value)

    let paramTypes = this.getParamTypes(
      params
    )

    let typeName = FunctionType.constructName(
      paramTypes,
      retuType
    )

    var typeOfFunc: FunctionType = this.globalTable.findSymbol(
      typeName
    )

    if (!typeOfFunc) {
      let newType = new FunctionType(
        paramTypes,
        retuType
      )

      this.globalTable.addSymbol(newType)
      typeOfFunc = newType
    }

    let funcValue = this.valueTable
      .addNewFuncValue(
        typeOfFunc,
        body,
        this.currentScope,
        params
      )

    return funcValue
  }

  visitFuncDecl (name: Token, params: AST[], body: AST, retType?: Token): Value {
    if (this.currentScope.symbolExists(name.value)) {
      throw `Redefinition of symbol ${name.value}`
    } else {
      const retuType = (retType == null) ? null : this.currentScope.findSymbol(retType!.value)

      let paramTypes = this.getParamTypes(
        params
      )

      let typeName = FunctionType.constructName(
        paramTypes,
        retuType
      )

      var typeOfFunc = this.globalTable.findSymbol(
        typeName
      )

      if (typeOfFunc == null) {
        let newType = new FunctionType(
          paramTypes,
          retuType
        )

        this.globalTable.addSymbol(newType)
        typeOfFunc = newType
      }

      let funcValue = this.valueTable
        .addNewFuncValue(
          typeOfFunc,
          body,
          this.currentScope,
          params
        )

      let newFunctionSymbol = new FunctionSymbol(
        name.value,
        typeOfFunc!,
        funcValue.address
      )
      funcValue.addReference(newFunctionSymbol)

      this.currentScope.addSymbol(newFunctionSymbol)
    }

    return null
  }

  getParamTypes (params: AST[]): [TypeSymbol, boolean][] {
    var ts: [TypeSymbol, boolean][] = []
    for (let param of params) {
      switch (param.kind) {
        case 'Declaration':
          const ft = this.currentScope.findSymbol(param.varType.value)
          if (ft) {
            // eslint ignore-next-line
            ts.push([ft, param.initial == null])
          } else {
            throw `Unknown type ${param.varType.value}.`
          }
          break
        default:
          throw 'Expected parameter declaration inside function parentesis.'
      }
    }

    return ts
  }

  visitFuncBody (statements: AST[]): Value {
    let bodyScope = new SymbolTable('func-body-scope', null, this.currentScope)
    this.currentScope = bodyScope

    for (let str of statements) {
      this.visit(str)
      if (this.returning) {
        break
      }
    }

    for (let b of Object.keys(bodyScope.symbols)) {
      this.valueTable.removeReferences(bodyScope.symbols[b])
    }

    this.currentScope = bodyScope.parent

    let ret = this.returning
    this.returning = null
    return ret || this.null
  }

  visitFuncCall (exprFunc: AST, args: AST[], fname?: Token): Value {
    if (this.callDepth >= this.MAX_CALL_DEPTH) {
      throw 'Max call stack depth exceeded'
    }

    let funct = fname
    if (funct) {
      var argsTaken = -1
      switch (funct.value) {
        case 'pow':
          if (args.length === 2) {
            let left = this.visit(args[0])
            let right = this.visit(args[1])
            let result = Math.pow(left.value, right.value)
            return this.valueTable.addNewValue(
              this.globalTable.findSymbol('double'),
              result
            )
          } else if (args.length === 1) {
            let left = this.visit(args[0])
            let result = Math.pow(left.value, 2)
            return this.valueTable.addNewValue(
              this.globalTable.findSymbol('double'),
              result
            )
          } else {
            argsTaken = 2
            break
          }
        case 'sqrt':
          if (args.length === 1) {
            let arg = this.visit(args[0])
            let result = Math.sqrt(arg.value)
            return this.valueTable.addNewValue(
              this.globalTable.findSymbol('double'),
              result
            )
          } else {
            argsTaken = 1
          }
          break
        case 'sin':
          if (args.length === 1) {
            let arg = this.visit(args[0])
            let result = Math.sin(arg.value)
            return this.valueTable.addNewValue(
              this.globalTable.findSymbol('double'),
              result
            )
          } else {
            argsTaken = 1
          }
          break
        case 'cos':
          if (args.length === 1) {
            let arg = this.visit(args[0])
            let result = Math.cos(arg.value)
            return this.valueTable.addNewValue(
              this.globalTable.findSymbol('double'),
              result
            )
          } else {
            argsTaken = 1
          }
          break
        case 'println':
          let mappedNodesP = args.map(x => this.visit(x).toString())

          console.log(...mappedNodesP, '\n')
          return this.null
        case 'print':
          let mappedNodes = args.map(x => this.visit(x).toString())

          console.log(...mappedNodes)
          return this.null
        // case 'read':
        //     if (args.length == 1) {
        //         console.log(this.visit(args[0]).value)
        //     } else if (args.length != 0) {
        //         argsTaken = 1
        //         break
        //     } else {
        //         print("> ")
        //     }
        //     return create_literal(value: readLine() ?? "", type: "double")
        default:
          argsTaken = -1
      }

      if (argsTaken !== -1) {
        throw `Error: The funcion ${funct.value} takes ${argsTaken} arguments.`
      }
    }

    const resolvedExpr = this.visit(exprFunc)
    const fVal: FunctionValue = resolvedExpr as FunctionValue
    if (fVal) {
      const funcScope = new SymbolTable('func-scope', null, fVal.scope)
      const calleeScope = this.currentScope

      let newDecls: AST[] = []
      let initValues: [Token, Value][] = []
      for (let i = 0; i < args.length; i++) {
        let par = fVal.params[i]
        if (args.length > i) {
          switch (par.kind) {
            case 'Declaration':
              let newValue = this.visit(args[i])

              if (newValue.type instanceof BuiltinTypeSymbol) {
                newValue = this.valueTable.copyValue(newValue)
              }

              initValues.push([par.token, newValue])
            default:
              break
          }
        }

        newDecls.push(par)
      }

      this.currentScope = funcScope
      this.callDepth += 1

      for (let i = 0; i < newDecls.length; i++) {
        let dec = newDecls[i]
        this.visit(dec)

        if (i < initValues.length) {
          let newVar = this.currentScope.findSymbol(initValues[i][0].value)
          newVar.value = initValues[i][1].address
          initValues[i][1].addReference(newVar)
        }
      }

      let result = this.visit(fVal.value)
      this.valueTable.cleanUp(funcScope)
      result && (result.important = false)
      this.currentScope = calleeScope
      this.callDepth -= 1
      return result
    } else {
      throw `Error: Undefined function ${fname.value}`
    }
  }

  visitReturn (val: AST): Value {
    let ret = this.visit(val)
    this.returning = ret
    this.returning && (this.returning.important = true)
    return this.null
  }

  visitBlock (statements: AST[]): Value {
    let blockScope = new SymbolTable('block_scope', null, this.currentScope)
    this.currentScope = blockScope

    for (let st of statements) {
      this.visit(st)

      if (this.breaking || this.returning !== null) {
        break
      }
    }

    this.currentScope = blockScope.parent
    this.valueTable.cleanUp(blockScope)

    return this.null
  }

  visitTernaryOp (cond: AST, trueb: AST, falseb: AST): Value {
    const condition = this.visit(cond)
    if (condition.type === this.globalTable.findSymbol('bool')) {
      if (condition.value) {
        return this.visit(trueb)
      } else {
        return this.visit(falseb)
      }
    } else {
      throw 'Required boolean expression as condition for ternary operand.'
    }
  }

  visitIf (expression: AST, trueBlock: AST, falseBlock?: AST): Value {
    const condition = this.visit(expression)
    if (condition.type === this.globalTable.findSymbol('bool')) {
      if (condition.value) {
        return this.visit(trueBlock)
      } else if (falseBlock) {
        return this.visit(falseBlock)
      }
    } else {
      throw 'Required boolean expression as condition for if statement.'
    }

    return this.null
  }

  visitLoop (body: AST): Value {
    while (true) {
      this.visit(body)
      if (this.breaking) {
        this.breaking = false
        break
      }
    }

    return this.null
  }

  visitWhile (comp: AST, body: AST): Value {
    let result = this.visit(comp)
    let resultValue = result.value
    if (result.type !== this.globalTable.findSymbol('bool')) {
      throw 'The comparison expression on a while loop must resolve to type bool.'
    }

    while (resultValue) {
      this.visit(body)
      if (this.breaking) {
        this.breaking = false
        break
      }

      resultValue = this.visit(comp).value
    }

    return this.null
  }

  visitFor (initi: AST, comp: AST, inc: AST, body: AST): Value {
    let forScope = new SymbolTable('for:loop', null, this.currentScope)
    this.currentScope = forScope

    this.visit(initi)
    let resultValue = this.visit(comp).value

    if (!this.isBoolean(resultValue)) {
      throw 'The comparison expression on a for loop must resolve to type bool.'
    }
    while (resultValue) {
      this.visit(body)
      if (this.breaking) {
        this.breaking = false
        break
      }

      this.visit(inc)
      resultValue = this.visit(comp).value
    }

    this.currentScope = forScope.parent!
    this.valueTable.cleanUp(forScope)

    return this.null
  }

  visitVarDeclaration (type: Token, name: Token, assign?: AST): Value {
    if (this.currentScope.symbolExists(name.value)) {
      throw `Duplicate variable: ${name.value}`
    } else {
      let type_ = this.currentScope.findSymbol(type.value)
      if (!type_) {
        throw `Unkown identifier ${type.value}.'`
      }

      let newVar: VarSymbol
      let valueReturn: Value

      if (assign) {
        var newValue = this.visit(assign)

        if (newValue.type instanceof BuiltinTypeSymbol) {
          newValue = this.valueTable.copyValue(newValue)
        }

        newVar = new VarSymbol(
          name.value,
          type_,
          newValue.address
        )

        newValue.addReference(newVar)

        valueReturn = newValue
      } else {
        newVar = new VarSymbol(
          name.value,
          type_
        )

        valueReturn = this.null
      }

      this.currentScope.addSymbol(newVar)

      return valueReturn
    }
  }

  getMemberVarSymbol (mem: AST): Symbol {
    var varSym: Symbol = null
    switch (mem.kind) {
      case 'Variable':
        varSym = this.currentScope.findSymbol(mem.token.value)
        break
      case 'MemberVar':
        let memSym = this.getMemberVarSymbol(mem.inst)
        let vSym = this.valueTable.findFromPointer(memSym.value || 0)
        if (vSym instanceof InstanceValue) {
          varSym = vSym.scope.findSymbol(mem.name.value)
        } else {
          throw `Not a valid instance ${memSym.name}`
        }
        break
      case 'StaticVar':
        let instSym = this.getMemberVarSymbol(mem.inst)
        let variableSym = this.valueTable.findFromPointer(instSym.value || 0)
        if (variableSym instanceof InstanceValue) {
          varSym = variableSym.scope.findSymbol(mem.name.value)
        } else if (variableSym instanceof ClassValue) {
          varSym = variableSym.classScope.findSymbol(mem.name.value)
        } else {
          throw `Not a valid instance ${instSym.name}`
        }
        break
      default:
        break
    }

    return varSym
  }

  visitAssignment (expr: AST, val: AST): Value {
    let result = this.visit(val)

    let varSym = this.getMemberVarSymbol(expr)

    let addressValue = varSym.value

    if (addressValue) {
      let theValue = this.valueTable.findFromPointer(addressValue)

      let newValue = result

      if (theValue) theValue.removeReference(varSym)

      if (newValue.type instanceof BuiltinTypeSymbol) {
        newValue = this.valueTable.addNewValue(result.type, result.value)
      }

      varSym.value = newValue.address

      newValue.addReference(varSym)
    } else {
      let newValue = result

      if (newValue.type instanceof BuiltinTypeSymbol) {
        newValue = this.valueTable.addNewValue(result.type, result.value)
      }

      varSym.value = newValue.address
      newValue.addReference(varSym)
    }

    return result
  }

  visitVariable (token: Token): Value {
    let symbolFound = this.currentScope.findSymbol(token.value)
    if (symbolFound) {
      let add = symbolFound.value
      if (add) {
        let val = this.valueTable.findFromPointer(add)

        return val || this.null
      } else {
        return this.null
      }
    } else {
      throw `NameError: Variable named ${token.value} wasn't found.`
    }
  }

  visitDouble (token: Token): Value {
    let val = this.createLiteral(token.value, 'double')
    return val
  }

  visitInt (token: Token): Value {
    return this.createLiteral(token.value, 'int')
  }

  visitBool (token: Token): Value {
    return this.createLiteral(token.value, 'bool')
  }

  visitStr (token: Token): Value {
    return this.createLiteral(token.value, 'string')
  }

  eval (text: string): any {
    this.parser.setText(text)

    this.currentScope = this.replScope
    let root = this.parser.statementList()

    var result: Value = null

    for (const node of root) {
      result = this.visit(node)
    }

    this.currentScope = this.globalTable

    // eslint-disable-next-line
    return (result && result.value != undefined) ? result.value : 'null'
  }

  interpret (text: string): any {
    this.parser.setText(text)

    this.currentScope = new SymbolTable('interpret-scope', null, this.currentScope)
    let root = this.parser.statementList()

    var result: Value = null

    for (const node of root) {
      result = this.visit(node)
    }

    this.currentScope = this.globalTable

    // eslint-disable-next-line
    return (result && result.value != undefined) ? result.value : 'null'
  }
}
