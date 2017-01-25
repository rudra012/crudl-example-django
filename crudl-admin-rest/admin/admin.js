import React from 'react'
import CustomDashboard from './dashboard'

var users = require('./collections/users')
var sections = require('./collections/sections')
var categories = require('./collections/categories')
var tags = require('./collections/tags')
var entries = require('./collections/entries')
var connectors = require('./connectors/connectors')
var { login, logout } = require('./auth')
var options = require('./options')

var admin = {
    title: 'crudl.io Django REST Example',
    connectors,
    views: {
        users,
        sections,
        categories,
        tags,
        entries,
    },
    auth: {
        login,
        logout,
    },
    custom: {
        dashboard: (<CustomDashboard />),
    },
    options,
    messages: {
        'login.button': 'Sign in',
        'logout.button': 'Sign out',
        'logout.affirmation': 'Have a nice day!',
        'pageNotFound': 'Sorry, page not found.',
    }
}

export default admin
