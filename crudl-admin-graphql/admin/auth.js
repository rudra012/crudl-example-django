import { login as loginConnector } from '../../crudl-admin-rest/admin/connectors'

//-------------------------------------------------------------------
var login = {
    actions: {
        login: (req) => loginConnector.create(req),
    },
}

login.fields = [
    {
        name: 'username',
        label: 'Username',
        field: 'Text',
    },
    {
        name: 'password',
        label: 'Password',
        field: 'Password',
    },
]

//-------------------------------------------------------------------
module.exports = {
    login,
    logout: undefined, // Logout is optional
}
