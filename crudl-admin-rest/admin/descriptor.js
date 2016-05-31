
var users = require('./collections/users')
var entries = require('./collections/entries')
var categories = require('./collections/categories')
var connexes = require('./connexes/connexes')
var auth = require('./auth')

var descriptor = {
    connexes,
    collections: [],
    auth,
}

descriptor.collections.push(users)
descriptor.collections.push(entries)
descriptor.collections.push(categories)

module.exports = descriptor
