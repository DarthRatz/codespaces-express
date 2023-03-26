import express from "express";
import dotenv from "dotenv";
import { SageMaker } from "@aws-sdk/client-sagemaker";
import * as _ from 'lodash'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const region = process.env.REGION || "us-east-1";

const sagemaker = new SageMaker({ region });
const sagemakerMethods = getObjectMethods(sagemaker);

app.use(express.json())

app.get("/sagemaker", (req, res) => {
  const asList = req.query.asList === "true";
  countMethodsByFirstWord(sagemakerMethods)
  
  if (asList) {
    const returnList = arrayToHTMLList(sagemakerMethods);
    res.send(returnList);
    return;
  }
  
  res.send(sagemakerMethods);
});

app.get("/sagemaker/:functionName", (req, res) => {
  const getMethods = sagemakerMethods.filter(
    (methodName) =>
      methodName.startsWith("get") ||
      methodName.startsWith("list") ||
      methodName.startsWith("describe")
  );
  if (!isValidCommand(getMethods, req.params.functionName)) {
    res.status(404).send(`${req.params.functionName} is not a valid endpoint.`);
    return;
  }

  const FunctionName = _.camelCase(req.params.functionName);
  const params = _.merge({}, req.query, req.body);
  console.log(params);

  sagemaker[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data);
    })
    .catch((error: any) => {
      console.log(error);
      res.status(400).send(error);
    });
});

app.post("/sagemaker/:functionName", (req, res) => {
  const postMethods = sagemakerMethods.filter(
    (methodName) =>
    methodName.startsWith("add") ||
      methodName.startsWith("create") ||
      methodName.startsWith("update")
  );
  if (!isValidCommand(postMethods, req.params.functionName)) {
    res.status(404).send(`${req.params.functionName} is not a valid endpoint.`);
    return;
  }

  const FunctionName = _.camelCase(req.params.functionName);
  const params = _.merge({}, req.query, req.body);

  console.log(params);
  
  sagemaker[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data);
    })
    .catch((error: any) => {
      console.log(error);
      res.status(400).send(error);
    });
});

app.delete("/sagemaker/:functionName", (req, res) => {
  const deleteMethods = sagemakerMethods.filter(
    (methodName) =>
      methodName.startsWith("delete") ||
      methodName.startsWith("remove")
  );
  if (!isValidCommand(deleteMethods, req.params.functionName)) {
    res.status(404).send(`${req.params.functionName} is not a valid endpoint.`);
    return;
  }

  const FunctionName = _.camelCase(req.params.functionName);
  const params = _.merge({}, req.query, req.body);

  sagemaker[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data);
    })
    .catch((error: any) => {
      console.log(error);
      res.status(400).send(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function arrayToHTMLList(array: string[]) {
  let returnList = `<ul>`;
  for (const method of array) {
    returnList += `<li>${method}</li>`;
  }
  returnList += `</ul>`;
  return returnList;
}

function getObjectMethods(obj: any): string[] {
  let methods: string[] = [];
  let currentObj = obj;

  while (currentObj) {
    const objMethods = Object.getOwnPropertyNames(currentObj).filter(
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

function isValidCommand(methods: string[], commandName: string): boolean {
  return methods.includes(commandName);
}

function countMethodsByFirstWord(methods: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const method of methods) {
      const firstWord = _.kebabCase(method).split('-')[0];
      result[firstWord] = (result[firstWord] || 0) + 1;
  }
  
  console.table(result);
  return result;
}
