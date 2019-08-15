import Symbol, { TypeSymbol, BuiltinTypeSymbol, SymbolTable, FunctionType, ClassSymbol } from './symbol'
import AST from './ast'

class Value {
  type: TypeSymbol
  value: any

  address: number

  references: Symbol[] = []

  important: boolean = false

  constructor (type: TypeSymbol, value: any, address: number) {
    this.type = type
    this.value = value
    this.address = address
  }

  addReference (ref: Symbol) {
    this.references.push(ref)
  }

  removeReference (ref: Symbol) {
    let ind = this.references.indexOf(ref)
    if (ind !== -1) {
      this.references.splice(ind, 1)
    }
  }

  toString (): string {
    if (this.type instanceof BuiltinTypeSymbol) {
      return `${this.value}`
    }

    return `<value> at: ${this.address}`
  }
}

class FunctionValue extends Value {
  scope: SymbolTable
  params: AST[]
  constructor (type: FunctionType, scope: SymbolTable, value: AST, address: number, params: AST[]) {
    super(type, value, address)
    this.scope = scope
    this.params = params
  }

  toString (): string {
    return `<func ${this.type.name} at: ${this.address}>`
  }
}

class ClassValue extends Value {
  outerScope: SymbolTable
  classScope: SymbolTable
  constructor (type: ClassSymbol, scope: SymbolTable, outerScope: SymbolTable, value: AST, address: number) {
    super(type, value, address)
    this.outerScope = outerScope
    this.classScope = scope
  }

  toString (): string {
    return `<Class: ${this.type.name} at: ${this.address}>`
  }
}

class InstanceValue extends Value {
  molde: ClassValue
  scope: SymbolTable
  constructor (type: ClassSymbol, molde: ClassValue, scope: SymbolTable, address: number) {
    super(type, 'instValue', address)
    this.molde = molde
    this.scope = scope
  }

  toString (): string {
    return `<instance of ${this.type.name} at: ${this.address}>`
  }
}

class ValueTable {
  values: { [key: number]: Value } = {}

  get lastInd (): number {
    let greatestIndx = -1
    for (let value in this.values) {
      if (Number(value) > greatestIndx) {
        greatestIndx = Number(value)
      }
    }
    return greatestIndx
    // return this.values.sort({x, y in x.key < y.key}).last?.key ?? -1
  }

  init () {
    this.values = {}
  }

  addNewValue (type: TypeSymbol, value: any): Value {
    let newAddress = this.lastInd + 1

    let val = new Value(type, value, newAddress)

    this.values[newAddress] = val
    return val
  }

  addNewFuncValue (type: FunctionType, value: AST, scope: SymbolTable, params: AST[]): Value {
    let newAddress = this.lastInd + 1

    let val = new FunctionValue(
      type,
      scope,
      value,
      newAddress,
      params
    )

    this.values[newAddress] = val
    return val
  }

  addNewClassValue (type: ClassSymbol, scope: SymbolTable, outerScope: SymbolTable, value: AST): Value {
    let newAddress = this.lastInd + 1

    let val = new ClassValue(
      type,
      scope,
      outerScope,
      value,
      newAddress
    )

    this.values[newAddress] = val
    return val
  }

  addNewInstanceValue (
    type: ClassSymbol, molde: ClassValue, scope: SymbolTable)
    : Value {
    let newAddress = this.lastInd + 1

    let val = new InstanceValue(
      type,
      molde,
      scope,
      newAddress
    )

    this.values[newAddress] = val
    return val
  }

  copyValue (val: Value): Value {
    let newVal: Value
    if (val.type instanceof FunctionType && val instanceof FunctionValue) {
      newVal = this.addNewFuncValue(
        val.type,
        val.value,
        val.scope,
        val.params
      )
    } else {
      newVal = this.addNewValue(val.type, val.value)
    }

    return newVal
  }

  removeReferences (ref: Symbol) {
    for (const key in this.values) {
      const val = this.values[key]
      if (val.references.indexOf(ref) !== -1) {
        val.removeReference(ref)
      }
    }
  }

  findFromPointer (ptr: number): Value {
    return this.values[ptr]
  }

  cleanUp (symTable: SymbolTable = undefined) {
    if (symTable) {
      for (const key in symTable.symbols) {
        const ref = symTable.symbols[key]
        this.removeReferences(ref)
      }
    }

    const newValues: { [key: number]: Value } = {}
    for (const key in this.values) {
      const y = this.values[key]
      if (y.references.length !== 0 || y.important) {
        newValues[key] = y
      }
    }

    this.values = newValues
  }
}

export default Value
export { ValueTable, InstanceValue, ClassValue, FunctionValue }
