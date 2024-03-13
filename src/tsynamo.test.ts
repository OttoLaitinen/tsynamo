import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PartitionKey, SortKey } from "./ddbTypes";
import { Tsynamo } from "./index";

interface DDB {
  myTable: {
    userId: PartitionKey<string>;
    timestamp: SortKey<string>;
    somethingElse: string;
  };
}

describe("tsynamo", () => {
  const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const mockSend = vi.fn();

  beforeAll(() => {
    vi.spyOn(ddbClient, "send").mockImplementation(mockSend);
    mockSend.mockReturnValue(Promise.resolve({}));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getItemQueryBuilder", () => {
    it("sends a basic get command", async () => {
      const tsynamoClient = new Tsynamo<DDB>({
        ddbClient,
      });

      await tsynamoClient
        .getItemFrom("myTable")
        .keys({
          userId: "123",
          timestamp: "123",
        })
        .consistentRead(true)
        .attributes(["somethingElse"])
        .execute();

      expect(mockSend).toMatchSnapshot();
    });
  });

  describe("queryQueryBuilder", () => {
    it("sends a basic query command", async () => {
      const tsynamoClient = new Tsynamo<DDB>({
        ddbClient,
      });

      await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "3")
        .keyCondition("timestamp", "<=", "2020-01-01")
        .filterExpression("somethingElse", "<", "2")
        .orFilterExpression("somethingElse", ">", "10")
        .execute();

      expect(mockSend).toMatchSnapshot();
    });
  });
});