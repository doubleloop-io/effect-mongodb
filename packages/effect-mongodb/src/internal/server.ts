import type { MongoClient } from "mongodb"

export type Server = {
  hosts: Array<string>
  srvHost?: string
}

export const fromClient = (client: MongoClient): Server =>
  make(client.options.hosts.map((x) => x.toString()), client.options.srvHost)

const SCHEME = /mongodb(\+srv)?:\/\//
const CREDENTIALS = /(?:[^/?]*@)?/
const HOSTS = /([^/?]+)/
// https://www.mongodb.com/docs/manual/reference/connection-string-formats/
const MONGO_CONNECTION_STRING = new RegExp(`^${SCHEME.source}${CREDENTIALS.source}${HOSTS.source}`, "i")

export const fromUrl = (url: string): Server => {
  const match = url.match(MONGO_CONNECTION_STRING)
  if (!match) return make([UNKNOWN_HOST])
  const [, srv, hosts] = match
  return srv ? make([], hosts) : make(hosts.split(","))
}

const make = (hosts: Array<string>, srvHost?: string): Server => srvHost === undefined ? { hosts } : { hosts, srvHost }

const UNKNOWN_HOST = "NO_HOST"
