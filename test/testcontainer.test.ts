import { expect, test } from "vitest"
import { describeMongo } from "./support/descrive-mongo.js"

describeMongo("test containers", (ctx) => {
  test("insert and find", async () => {
    const db = ctx._database()
    const users = db.collection("users")

    await users.insertMany([
      { id: 1, name: "ANY_NAME_1" },
      { id: 2, name: "ANY_NAME_2" },
      { id: 3, name: "ANY_NAME_3" }
    ])

    const result = await users.find({}).toArray()

    expect(result).toEqual([
      expect.objectContaining({ id: 1, name: "ANY_NAME_1" }),
      expect.objectContaining({ id: 2, name: "ANY_NAME_2" }),
      expect.objectContaining({ id: 3, name: "ANY_NAME_3" })
    ])
  })
})
