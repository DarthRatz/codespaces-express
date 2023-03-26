import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import express from "express";
import * as _ from 'lodash';
import { arrayToHTMLList, countMethodsByFirstWord, getObjectMethods, isValidCommand } from "./methods";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const region = process.env.REGION || "us-east-1";

const s3 = new S3({ region });
const s3Methods = getObjectMethods(s3);

app.use(express.json())

app.get("/s3", (req, res) => {
  const asList = req.query.asList === "true";
  countMethodsByFirstWord(s3Methods)
  
  if (asList) {
    const returnList = arrayToHTMLList(s3Methods);
    res.send(returnList);
    return;
  }
  
  res.send(s3Methods);
});

app.get("/s3/:functionName", (req, res) => {
  const getMethods = s3Methods.filter(
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

  s3[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data);
    })
    .catch((error: any) => {
      console.log(error);
      res.status(400).send(error);
    });
});

app.post("/s3/:functionName", (req, res) => {
  const postMethods = s3Methods.filter(
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
  
  s3[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data);
    })
    .catch((error: any) => {
      console.log(error);
      res.status(400).send(error);
    });
});

app.delete("/s3/:functionName", (req, res) => {
  const deleteMethods = s3Methods.filter(
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

  s3[FunctionName](params)
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
