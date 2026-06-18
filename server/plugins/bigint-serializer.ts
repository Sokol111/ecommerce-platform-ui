// Protobuf int64 fields are deserialized as BigInt in TypeScript.
// JSON.stringify does not support BigInt natively, so we patch it globally here.
;(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this)
}

export default defineNitroPlugin(() => {})
