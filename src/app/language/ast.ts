import Token from "./token"

interface Double {
    kind: "Double"
    token: Token
}
interface Int {
    kind: "Int"
    token: Token
}
interface Bool {
    kind: "Bool"
    token: Token
}
interface Str {
    kind: "Str"
    token: Token
}

interface TernaryOp {
    kind: "TernaryOp"
    cond: AST
    trueb: AST
    falseb: AST
}
interface BinOp {
    kind: "BinOp"
    op: Token
    left: AST
    right: AST
}
interface UnaryOp {
    kind: "UnaryOp"
    op: Token
    right: AST
}
interface NoOp {
    kind: "NoOp"

}

interface Declaration {
    kind: "Declaration"
    varType: Token
    token: Token
    initial?: AST
}
interface Variable {
    kind: "Variable"
    token: Token
}
interface Assignment {
    kind: "Assignment"
    token: AST
    right: AST
}

interface Block {
    kind: "Block"
    statements: AST[]
}


interface FuncExpression {
    kind: "FuncExpression"
    params: AST[]
    retType?: Token
    body: AST
}
interface FuncDecl {
    kind: "FuncDecl"
    token: Token
    params: AST[]
    retType?: Token
    body: AST
}
interface FuncCall {
    kind: "FuncCall"
    fun: AST
    fuName?: Token
    args: AST[]
}
interface FuncBody {
    kind: "FuncBody"
    statements: AST[]
}
interface Return {
    kind: "Return"
    val: AST
}

interface If {
    kind: "If"
    expression: AST
    trueb: AST
    falseb?: AST
}
interface For {
    kind: "For"
    ini: AST
    cond: AST
    incr: AST
    body: AST
}
interface While {
    kind: "While"
    cond: AST
    body: AST
}
interface Loop {
    kind: "Loop"
    body: AST
}
interface Break {
    kind: "Break"
}

interface Class {
    kind: "Class"
    name: Token
    inherits?: Token
    body: AST
}
interface ClassBody {
    kind: "ClassBody"
    statements: AST[]
}
interface InstanceBody {
    kind: "InstanceBody"
    statements: AST[]
}
interface ClassInitializer {
    kind: "ClassInitializer"
    name: Token
    params: AST[]
}
interface ConstructorDecl {
    kind: "ConstructorDecl"
    body: AST
    params: AST[]
}
interface ConstructorCall {
    kind: "ConstructorCall"
    name: Token
}
interface StaticStatement {
    kind: "StaticStatement"
    statement: AST
}
interface MemberVar {
    kind: "MemberVar"
    inst: AST
    name: Token
}
interface StaticVar {
    kind: "StaticVar"
    inst: AST
    name: Token
}

type AST = Double |
    Int |
    Bool |
    Str |
    TernaryOp |
    BinOp |
    UnaryOp |
    NoOp |
    Declaration |
    Variable |
    Assignment |
    Block |
    FuncExpression |
    FuncDecl |
    FuncCall |
    FuncBody |
    Return |
    If |
    For |
    While |
    Loop |
    Break |
    Class |
    ClassBody |
    InstanceBody |
    ClassInitializer |
    ConstructorDecl |
    ConstructorCall |
    StaticStatement |
    MemberVar |
    StaticVar

export default AST