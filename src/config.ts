import type { CreateCollectionRequest } from "@nillion/secretvaults";

export const NETWORK_CONFIG = {
  chainId: "nillion-chain-devnet",
  nilchain: "http://localhost:40923/api/proxy/devnet",
  nilauth: "http://localhost:40921",
  nildb: ["http://localhost:40081", "http://localhost:40082", "http://localhost:40083"],
};

export const DEMO_COLLECTION_PAYLOAD: Omit<CreateCollectionRequest, "_id"> = {
  type: "standard",
  name: "demo_collection",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    uniqueItems: true,
    items: {
      type: "object",
      properties: {
        _id: { type: "string", format: "uuid" },
        description: { type: "string" },
        secret: {
          type: "object",
          properties: { "%share": { type: "string" } },
        },
      },
      required: ["_id", "description", "secret"],
    },
  },
};

// This query finds the oldest record, the newest record, and the total count.
export const DEMO_QUERY_PIPELINE = [
  {
    $facet: {
      oldestRecord: [{ $sort: { _created: 1 } }, { $limit: 1 }],
      newestRecord: [{ $sort: { _created: -1 } }, { $limit: 1 }],
      recordCount: [{ $count: "count" }],
    },
  },
  {
    $project: {
      oldestRecord: { $arrayElemAt: ["$oldestRecord", 0] },
      newestRecord: { $arrayElemAt: ["$newestRecord", 0] },
      recordCount: {
        $ifNull: [{ $arrayElemAt: ["$recordCount.count", 0] }, 0],
      },
    },
  },
];
