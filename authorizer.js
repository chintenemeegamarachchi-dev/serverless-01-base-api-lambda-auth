const { CognitoJwtVerifier } = require("aws-jwt-verify");

const jwtTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USERPOOL_ID,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const generatePolicy = (principal, effect, resource) => {
  let result = {};
  result.principalId = principal;
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: effect,
        Action: "execute-api:Invoke",
        Resource: resource,
      },
    ],
  };
  result.policyDocument = policyDocument;
  result.context = {
    whoLivesInAPinapleUnderTheSea: "sbqp",
  };
  return result;
};

module.exports.handler = async (event, context, callBack) => {
  const token = event.authorizationToken;
  try {
    const payload = await jwtTokenVerifier.verify(token);
    console.log(payload);
    callBack(
      null,
      generatePolicy(payload.principalId, "Allow", event.methodArn)
    );
  } catch (err) {
    callBack(null, err.message);
  }
};
