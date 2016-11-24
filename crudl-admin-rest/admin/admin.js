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
        'changeView.button.delete': 'Löschen',
        'changeView.button.saveAndContinue': 'Speichern und weiter bearbeiten',
        'changeView.button.save': 'Speichern',
        'changeView.button.saveAndBack': 'Speichern und zurück',
        'modal.labelCancel.default': 'Abbrechen',
        'login.button': 'Sign in',
        'logout.affirmation': 'Tchüß!',
        'logout.loginLink': 'Nochmal einloggen?',
        'logout.button': 'Abmelden',
        'pageNotFound': 'Die gewünschte Seite wurde nicht gefunden!',
    }
}

export default admin
