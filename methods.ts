import { kebabCase } from "lodash";

export function arrayToHTMLList(array: string[]) {
  const listItems = array.map((x) => `<li>${x}</li>`).join("");
  return `<ul>${listItems}</ul>`;
}

export function getObjectMethods(obj: Record<string, any>): string[] {
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

export function isValidCommand<T>(methodName: string, methodList: string[]): methodName is Extract<keyof T, string> {
  return methodList.some(key => key === methodName);
}

export function countMethodsByFirstWord(methods: string[]): Record<string, number> {
  const results: Record<string, number> = {};
  for (const method of methods) {
    const firstWord = kebabCase(method).split("-")[0];
    results[firstWord] = (results[firstWord] || 0) + 1;
  }

  console.table(results);
  return results;
}
