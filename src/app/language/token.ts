
enum TokenType {
  NULL = 'NULL', // empty token

// Built in literals
  REAL = 'REAL', // Floating Point number literal(e.g: 1.0, 2.0, 3.1415)
  INT = 'INT', // Integer number literal  (e.g: 1, 2, 100)
  BOOL = 'BOOL', // Boolean literal (e.g: true, false)
  STR = 'STR', // String of text literal (e.g: 'Hello, world')

  ID = 'ID', // Identifier (e.g: i, var1)

  NL = 'NL', // Newline character (\n)
  COMMA = 'COMMA', // ,
  SEMI = 'SEMI', // ;
  COLON = 'COLON', // :

  DOT = 'DOT',
  DCOLON = 'DCOLON',
  QUEST = 'QUEST', // ?

  ARROW = 'ARROW', // ->

// Operators
  PLUS = 'PLUS', // +
  PLUSE = 'PLUSE', // +=
  PLUSP = 'PLUSP', // ++
  MINUS = 'MINUS', // -
  MINUSE = 'MINUSE', // -=
  MINUSP = 'MINUSP', // --

  MUL = 'MUL', // *
  MULE = 'MULE', // *=
  DIV = 'DIV', // /
  DIVE = 'DIVE', // /=

  AND = 'AND', // &&
  OR = 'OR', // ||

  POW = 'POW', // ^
  POWE = 'POWE', // ^=

  ASS = 'ASS', // =

  EQU = 'EQU', // ==
  NOT = 'NOT', // !
  NEQ = 'NEQ', // !=
  LT = 'LT', // <
  GT = 'GT', // >
  LET = 'LET', // <=
  GET = 'GET', // >=

// Delimiters
  LPAR = 'LPAR', // (
  RPAR = 'RPAR', // )
  LCUR = 'LCUR', // {
  RCUR = 'RCUR', // }
  LBRA = 'LBRA', // [
  RBRA = 'RBRA', // ]

// Keywords
// Represent their literal value
  IF = 'IF',
  ELSE = 'ELSE',
  FUNC = 'FUNC',
  RET = 'RET',
  FOR = 'FOR',
  WHILE = 'WHILE',
  LOOP = 'LOOP',
  BREAK = 'BREAK',

  CLASS = 'CLASS',
  INIT = 'INIT',
  NEW = 'NEW',
  STATIC = 'STATIC'
}

class Token {
  type: TokenType
  value: string

  constructor (type: TokenType, value: string) {
    this.type = type
    this.value = value
  }

  toString (): string {
    return `Token(${this.type}, ${this.value})`
  }
}

export default Token
export { TokenType }
