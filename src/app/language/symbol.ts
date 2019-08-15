let a = [2, true]

export default class Symbol {
  type?: TypeSymbol
  name: string
  value?: number
  isType: boolean

  constructor (name: string, type: TypeSymbol = null, addressValue: number = null) {
    this.name = name
    this.type = type
    this.isType = false
    this.value = addressValue
  }
}

class TypeSymbol extends Symbol {
  constructor (name: string, type: Symbol = null) {
    super(name)
    this.isType = true
  }
}

class BuiltinTypeSymbol extends TypeSymbol {}

class ClassSymbol extends TypeSymbol {
  constructor (name: string, type: Symbol = null, addressValue: number = null) {
    super(name)
    this.value = addressValue
  }
}

class VarSymbol extends Symbol {
  constructor (name: string, type: Symbol, addressValue: number = null) {
    super(
      name,
      type,
      addressValue
    )
  }
}

class FunctionType extends TypeSymbol {
  constructor (paramTypes: [TypeSymbol, boolean][], type?: TypeSymbol) {
    let newName = FunctionType.constructName(paramTypes, type)

    super(newName)
    this.type = type
  }

  static constructName (paramTypes: [TypeSymbol, boolean][], type?: TypeSymbol): string {
    const parameterNames = paramTypes.map((arg) => {
      let x = arg[0]
      let y = arg[1]
      return x.name + (y ? '' : '?')
    }).join(', ')

    let name = `(${parameterNames})`

    if (type) {
      name += `: ${type.name}`
    }

    return name
  }
}

class FunctionSymbol extends Symbol {
  constructor (name: string, type: FunctionType, addressValue: number = null) {
    super(name, type, addressValue)
  }
}

class SymbolTable {
  parent?: SymbolTable

  symbols: { [name: string]: Symbol }

  scopeName: string
  level: number

  constructor (name: string, types: { [name: string]: Symbol } = undefined, parent: SymbolTable = null) {
    this.symbols = types || {}

    this.parent = parent

    this.scopeName = name
    this.level = ((parent && parent.level) || -1) + 1
  }

  findSymbol (name: string): Symbol {
    let foundSymbol = this.symbols[name]
    if (foundSymbol) {
      return foundSymbol
    } else {
      let parentSymbol = this.parent && this.parent.findSymbol(name)
      if (parentSymbol) {
        return parentSymbol
      }
    }

    return null
  }

  addSymbol (sym: Symbol) {
    if (this.symbolExists(sym.name)) {
      throw `Invalid redefinition of symbol ${sym.name}.`
    }

    let tname = sym.type
    if (tname) {
      if (!tname.isType) {
        throw `Symbol(identifier) '${tname.name}' is not a type`
      }
    }

    this.symbols[sym.name] = sym
  }

  symbolExists (name: string): boolean {
    return this.symbols[name] != null
  }
}

export { TypeSymbol, BuiltinTypeSymbol, SymbolTable, VarSymbol, FunctionType, FunctionSymbol, ClassSymbol }
