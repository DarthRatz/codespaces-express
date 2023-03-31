import { S3 } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import express from "express";
import { merge } from "lodash";

import { arrayToHTMLList, countMethodsByFirstWord, getObjectMethods, isValidCommand } from "./methods";

config();

const app = express();
const port = process.env.PORT || 3000;
const region = process.env.REGION || "us-east-1";

const s3 = new S3({ region });
const s3Methods = getObjectMethods(s3);

app.use(express.json())

app.get("/s3", (req, res) => {
  const asList = req.query.asList === "true";
  const wordCount = req.query.wordCount === "true";

  if (wordCount) {
    return res.send(countMethodsByFirstWord(s3Methods));
  }
  
  if (asList) {
    const returnList = arrayToHTMLList(s3Methods);
    return res.send(returnList);
  }
  
  return res.send(s3Methods);
});

app.get("/s3/:functionName", (req, res) => {
  const getMethods = s3Methods.filter(
    (methodName) =>
      methodName.startsWith("get") ||
      methodName.startsWith("list") ||
      methodName.startsWith("describe")
    );

  const FunctionName = req.params.functionName;
  if (!isValidCommand<S3>(FunctionName, getMethods)) {
    return res.status(404).send(`${FunctionName} is not a valid endpoint.`);
  }

  const params = merge({}, req.query, req.body);
  
  (s3[FunctionName] as Function)(params)
    .then((data: object) => {
      console.log(FunctionName, data);
      return res.send(data);
    })
    .catch((error: Error) => {
      console.log(FunctionName, error);
      return res.status(400).send({ message: error.message });
    });
});

app.post("/s3/:functionName", (req, res) => {
  const postMethods = s3Methods.filter(
    (methodName) =>
      methodName.startsWith("add") ||
      methodName.startsWith("create") ||
      methodName.startsWith("update")
  );

  const FunctionName = req.params.functionName;
  if (!isValidCommand<S3>(FunctionName, postMethods)) {
    return res.status(404).send(`${FunctionName} is not a valid endpoint.`);
  }

  const params = merge({}, req.query, req.body);
  
  (s3[FunctionName] as Function)(params)
    .then((data: object) => {
      console.log(data);
      return res.send(data);
    })
    .catch((error: Error) => {
      console.log(FunctionName, error);
      return res.status(400).send({ message: error.message });
    });
});

app.delete("/s3/:functionName", (req, res) => {
  const deleteMethods = s3Methods.filter(
    (methodName) =>
      methodName.startsWith("delete") ||
      methodName.startsWith("remove")
  );

  const FunctionName = req.params.functionName;
  if (!isValidCommand<S3>(FunctionName, deleteMethods)) {
    return res.status(404).send(`${FunctionName} is not a valid endpoint.`);
  }

  const params = merge({}, req.query, req.body);

  (s3[FunctionName] as Function)(params)
    .then((data: object) => {
      console.log(data);
      return res.send(data);
    })
    .catch((error: Error) => {
      console.log(FunctionName, error);
      return res.status(400).send({ message: error.message });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
