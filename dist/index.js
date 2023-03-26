"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_sagemaker_1 = require("@aws-sdk/client-sagemaker");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const sagemaker = new client_sagemaker_1.SageMaker({ region: 'us-east-1' });
app.get('/sagemaker', (_req, res) => {
    let returnList = `<ul>`;
    for (const method of getObjectMethods(sagemaker)) {
        returnList += `<li>${method}</li>`;
    }
    returnList += (`</ul>`);
    res.send(returnList);
});
app.get("/sagemaker/:functionName", (req, res) => {
    const FunctionName = req.params.functionName;
    const params = req.query;
    sagemaker[FunctionName](params)
        .then((data) => {
        console.log(data);
        res.send(data);
    }).catch((error) => {
        console.log(error);
        res.send(error);
    });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
function getObjectMethods(obj) {
    let methods = [];
    let currentObj = obj;
    while (currentObj) {
        const objMethods = Object.getOwnPropertyNames(currentObj);
        methods = methods.concat(objMethods);
        currentObj = Object.getPrototypeOf(currentObj);
    }
    console.log(methods);
    return methods;
}
