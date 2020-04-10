import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const bucketName = process.env.IMAGES_S3_BUCKET
const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: process.env.region,
  params: {Bucket: bucketName}
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const memoryId = event.pathParameters.memoryId
  console.log(memoryId);
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: memoryId,
    Expires: 300
  })
  
  return {
    statusCode: 201,
       headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(
      {
        uploadUrl
      }
    )
  }
}
