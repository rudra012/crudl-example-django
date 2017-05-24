import pluralize from 'pluralize'

import { createFrontendConnector, createBackendConnector } from 'crudl-connectors-base'
import { crudToHttp, url, transformData } from 'crudl-connectors-base/lib/middleware'

import crudlErrors from './middleware/crudlErrors'
import listQuery from './middleware/listQuery'
import query from './middleware/query'

const baseURL = '/graphql-api/'

// Base connector
export function createGraphQLConnector() {
    return createFrontendConnector(createBackendConnector())
        .use(crudToHttp({ create: 'post', read: 'post', update: 'post', delete: 'post' }))
        .use(url(baseURL))
}

/**
* A resource connector. Use it like this:
* const users = createResourceConnector('users', 'id, username, email')
*
* users.read()                 // list
* users.create({...})          // create
* users(id).read()             // detail
* users(id).delete()           // delete
* users(id).update({...})      // update
*/
export function createResourceConnector(namePl, fields) {
    const nameSg = pluralize.singular(namePl)
    const NameSg = nameSg.charAt(0).toUpperCase() + nameSg.slice(1)

    //-- CREATE QUERY --
    const createQuery = `
    mutation ($input: Create${NameSg}Input!) {
        create${NameSg}(input: $input) {
            errors
            ${nameSg} {${fields}}
        }
    }
    `
    const createQueryData = `create${NameSg}.${nameSg}`    // e.g. createUser.user
    const createQueryError = `create${NameSg}.errors`      // e.g. createUser.errors

    //-- READ QUERY --
    const readQuery = `{ ${nameSg} (id: "%id") {${fields}} }`
    const readQueryData = nameSg

    //-- UPDATE QUERY --
    const updateQuery = `
    mutation ($input: Change${NameSg}Input!) {
        change${NameSg} (input: $input) {
            errors
            ${nameSg} {${fields}}
        }
    }
    `
    const updateQueryData = `change${NameSg}.${nameSg}`     // e.g. changeUser.user
    const updateQueryError = `change${NameSg}.errors`       // e.g. changeUser.errors

    //-- DELETE QUERY --
    const deleteQuery = `
    mutation ($input: Delete${NameSg}Input!) {
        delete${NameSg}(input: $input) {
            deleted
        }
    }
    `
    const deleteQueryData = 'delete${NameSg}.deleted'

    return createGraphQLConnector()
        .use(listQuery(namePl, fields))
        .use(query('create', createQuery, createQueryData, createQueryError))
        .use(query('read', readQuery, readQueryData))
        .use(query('update', updateQuery, updateQueryData, updateQueryError))
        .use(query('delete', deleteQuery, deleteQueryData))
        // We transform the delete request data to contain only the id
        .use(next => ({
            delete: req => next.delete(Object.assign(req, { data: { id: req.data.id }}))
        }))
        // Transform errors
        .use(crudlErrors)
}

/**
* USAGE: const options = createOptionsConnector('sections', 'id', 'name')
* options.read() // Resolves to { options: [ { value: '...', label: '...' }, { value: '...', label: '...' }, ...] }
*/
export function createOptionsConnector(namePl, valueKey, labelKey) {
    return createGraphQLConnector()
        .use(listQuery(namePl, `value: ${valueKey}, label: ${labelKey}`))
        .use(transformData('read', data => ({ options: data })))
}
