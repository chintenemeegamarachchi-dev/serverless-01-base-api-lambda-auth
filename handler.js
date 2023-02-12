'use strict';

const DynamoDb = require(`aws-sdk/clients/dynamodb`);
const documentClient = new DynamoDb.DocumentClient({
  region: process.env.REGION,
  maxRetries: 3,
  httpOptions: {
    timeout: 5000
  }
});
const NOTES_TBL_NAME = process.env.NOTES_TBL_NAME;

const send = (statusCode, body) => {
  return {
    statusCode,
    body
  }
}

module.exports.createNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const {id, title, ...body} = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
      Item: {
        notesId: id,
        title,
        body
      },
      ConditionExpression: "attribute_not_exists(notesId)"  
    }
    await documentClient.put(param).promise();
    callBack(null, send(201, event.body));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

module.exports.updateNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const {id, title, ...body} = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
      Key: {
        notesId: id
      },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body"
      },
      ExpressionAttributeValues: {
        ":title": title,
        ":body": body
      },
      ConditionExpression: "attribute_exists(notesId)"  
    }
    await documentClient.update(param).promise();
    callBack(null, send(200, event.body));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

module.exports.deleteNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const id = event.pathParameters.id;
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
      Key: {
        notesId: id
      },
      ConditionExpression: "attribute_exists(notesId)"  
    }
    await documentClient.delete(param).promise();
    callBack(null, send(200, id));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

module.exports.getAllNotes = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
    }
    const notes = await documentClient.scan(param).promise();
    callBack(null, send(200, JSON.stringify(notes)));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

