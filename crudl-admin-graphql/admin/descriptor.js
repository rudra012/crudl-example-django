
var entries = require('./collections/entries')
var connectors = require('./connectors/connectors')
var auth = require('./auth')

var descriptor = {
    connectors,
    collections: [],
    auth,
}

descriptor.collections.push(entries)

module.exports = descriptor
