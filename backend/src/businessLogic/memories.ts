import * as uuid from 'uuid'

import { MemoriesAccess } from '../dataLayer/memoriesAccess'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { CreateMemoryRequest } from '../requests/CreateMemoryRequest'
import { UpdateMemoryRequest } from '../requests/UpdateMemoryRequest'

const memoriesAccess = new MemoriesAccess()

export async function getMemories(event: APIGatewayProxyEvent) {
    let userId = event.requestContext.authorizer['principalId'];
    let {day, month} = event.queryStringParameters
    let memoryDay = `${day}/${month}`
    console.log('userId ', userId);
    console.log('day ', day);
    console.log('month ', month);
    
    return await memoriesAccess.getMemories(userId, memoryDay)
}

export async function createMemory(event: APIGatewayProxyEvent) {
    const memoryId = uuid.v4()
    let userId = event.requestContext.authorizer['principalId'];
    let newMemory: CreateMemoryRequest = JSON.parse(event.body)
    const bucketName = process.env.IMAGES_S3_BUCKET

    let newItem = {
        userId,
        memoryId,
        ...newMemory,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${memoryId}`
    }

    console.log('memoryId ', memoryId);
    console.log('userId ', userId);
    console.log('newMemory ', newMemory);

    return await memoriesAccess.createMemory(newItem)
}

export async function deleteMemory(event: APIGatewayProxyEvent) {
    const memoryId = event.pathParameters.memoryId
    let userId = event.requestContext.authorizer['principalId'];

    console.log('memoryId ', memoryId);
    console.log('userId ', userId);

    return await memoriesAccess.deleteMemory(memoryId)
}

export async function updateMemory(event: APIGatewayProxyEvent) {
    const memoryId = event.pathParameters.memoryId
    const updatedMemory: UpdateMemoryRequest = JSON.parse(event.body)
    let userId = event.requestContext.authorizer['principalId'];

    console.log('memoryId ', memoryId);
    console.log('updatedMemory ', updatedMemory);
    console.log('userId ', userId);
    
    return await memoriesAccess.updateMemory(memoryId, updatedMemory)
}
