import * as _ from "lodash";

export function arrayToHTMLList(array: string[]) {
  const listItems = array.map(x => `<li>${x}</li>`).join('') 
  return `<ul>${listItems}</ul>`;
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

export function isValidCommand<T>(methodName: string, methodList: unknown[]): methodName is Extract<keyof T, string> {
  return methodList.includes(methodName as keyof T);
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
