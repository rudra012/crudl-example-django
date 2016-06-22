
var users = require('./collections/users')
var categories = require('./collections/categories')
var tags = require('./collections/tags')
var entries = require('./collections/entries')
var connexes = require('./connexes/connexes')
var auth = require('./auth')
// var DateTimeField = require('./fields/DateTimeField')

var descriptor = {
    connexes,
    collections: [],
    auth,
}

descriptor.collections.push(users)
descriptor.collections.push(categories)
descriptor.collections.push(tags)
descriptor.collections.push(entries)

export default descriptor
