import * as _ from "lodash";

export function arrayToHTMLList(array: string[]) {
  let returnList = `<ul>`;
  for (const method of array) {
    returnList += `<li>${method}</li>`;
  }
  returnList += `</ul>`;
  return returnList;
}

export function getObjectMethods(obj: any): string[] {
  let methods: string[] = [];
  let currentObj = obj;

  while (currentObj) {
    const objMethods = Object.getOwnPropertyNames(currentObj)
      .filter(
        (methodName) =>
          methodName !== "destroy" &&
          methodName !== "send" &&
          !getDefaultObjectMethods().includes(methodName) &&
          typeof currentObj[methodName] === "function"
      );
    methods = methods.concat(objMethods);
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return methods;
}

function getDefaultObjectMethods(): string[] {
  const defaultObj = Object.getPrototypeOf({});
  return Object.getOwnPropertyNames(defaultObj);
}

export function isValidCommand(methods: string[], commandName: string): boolean {
  return methods.includes(commandName);
}

export function countMethodsByFirstWord(methods: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const method of methods) {
    const firstWord = _.kebabCase(method).split("-")[0];
    result[firstWord] = (result[firstWord] || 0) + 1;
  }

  console.table(result);
  return result;
}
