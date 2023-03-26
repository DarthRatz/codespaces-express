import express from 'express';
import dotenv from 'dotenv';
import { SageMaker } from '@aws-sdk/client-sagemaker'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const sagemaker = new SageMaker({ region: 'us-east-1' })

app.get('/sagemaker', (_req, res) => {
  let returnList = `<ul>`
  for (const method of getObjectMethods(sagemaker)) {
    returnList += `<li>${method}</li>`

  }
  returnList += (`</ul>`)
  res.send(returnList)
})

app.get("/sagemaker/:functionName", (req, res) => {
  const FunctionName = req.params.functionName;
  const params = req.query;
  sagemaker[FunctionName](params)
    .then((data: any) => {
      console.log(data);
      res.send(data)

    }).catch((error: any) => {
      console.log(error);
      res.send(error)
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function getObjectMethods(obj: any): string[] {
  let methods: string[] = [];
  let currentObj = obj;

  while (currentObj) {
    const objMethods = Object.getOwnPropertyNames(currentObj)
    methods = methods.concat(objMethods);
    currentObj = Object.getPrototypeOf(currentObj);
  }
  console.log(methods);
  return methods;
}
