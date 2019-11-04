
function compAny (a: any, b: any, test: (arg0: any, arg1: any) => boolean): boolean {
  if (typeof a !== typeof b) return false

  return test(a, b)
}

function sumAnyString (a: any, b: any): string {
  if (typeof a === 'string' || typeof b === 'string') {
    return `${a}${b}`
  }

  return null
}

function sumAny (a: any, b: any): any {
  return a + b
}

function subAny (a: any, b: any): any {
  return a - b
}

function mulAny (a: any, b: any): any {
  return a * b
}

function divAny (a: any, b: any): any {
  if (a % 1 !== 0) {
    if (b % 1 !== 0) {
      return a / b
    } else {
      return a / b
    }
  } else {
    if (b % 1 !== 0) {
      return a / b
    } else {
      return a / b
    }
  }
}

function powAny (a: any, b: any): number {
  return Number(a) ^ Number(b)
}

export { compAny, sumAny, subAny, mulAny, divAny, powAny }
