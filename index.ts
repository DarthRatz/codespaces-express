import express from "express";
import dotenv from "dotenv";
import { SageMaker } from "@aws-sdk/client-sagemaker";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const region = process.env.REGION || "us-east-1";

const sagemaker = new SageMaker({ region });

app.get("/sagemaker", (_req, res) => {
  let returnList = `<ul>`;
  for (const method of getObjectMethods(sagemaker)) {
    returnList += `<li>${method}</li>`;
  }
  returnList += `</ul>`;
  res.send(returnList);
});

app.get("/sagemaker/:functionName", (req, res) => {
  if (!isValidCommand(sagemaker, req.params.functionName)) {
    res.status(404).send(`${req.params.functionName} is not a valid endpoint.`);
    return;
  }

  const FunctionName = req.params.functionName;
  const params = req.query;
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

function getObjectMethods(obj: any): string[] {
  let methods: string[] = [];
  let currentObj = obj;

  while (currentObj) {
    const objMethods = Object.getOwnPropertyNames(currentObj).filter(
      (prop) => typeof currentObj[prop] === "function"
    );
    methods = methods.concat(objMethods);
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return methods;
}

function isValidCommand(client: Object, commandName: string): boolean {
  const methods = getObjectMethods(client);
  return methods.includes(commandName);
}
