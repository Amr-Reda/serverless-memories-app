import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class MemoriesAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly memoriesTable = process.env.MEMORIES_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }

    async getMemories(userId: string, mday: string) {
        
        const result = await this.docClient.query({
          TableName: this.memoriesTable,
          IndexName: this.indexName,
          KeyConditionExpression: 'userId = :userId AND mday = :mday',
          ExpressionAttributeValues: {
              ':userId': userId,
              ':mday': mday,
          },
        }).promise()
      
        return result.Items
    }

    async createMemory(newMemory: any) {
        await this.docClient
          .put({
            TableName: this.memoriesTable,
            Item: newMemory
          })
          .promise()
        newMemory.userId = undefined
        return newMemory
    }

    async deleteMemory(memoryId: string) {
        await this.docClient
          .delete({
            Key: { memoryId },
            TableName: this.memoriesTable,
          })
          .promise()
      
        return
    }

    async updateMemory(memoryId: string, updatedMemory: any) {
        await this.docClient
          .update({
            TableName: this.memoriesTable,
            Key: { memoryId },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedMemory.name,
                ':due': updatedMemory.dueDate,
                ':d': updatedMemory.done
            },
            ExpressionAttributeNames: {
              '#name': 'name',
              '#dueDate': 'dueDate',
              '#done': 'done'
            }
          })
          .promise()
        return
    }
}