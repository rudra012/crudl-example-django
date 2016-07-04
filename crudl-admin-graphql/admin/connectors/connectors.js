function pagination(res) {
    let hasNext = res.data.data.allEntries.pageInfo.hasNextPage
    let next = hasNext && {
        after: res.data.data.allEntries.pageInfo.endCursor
    }
    return { next }
}

function objectToArgs(object) {
    let args = Object.getOwnPropertyNames(object).map(name => {
        return `${name}: ${JSON.stringify(object[name])}`
    }).join(', ')
    return args ? `(${args})` : ''
}

function listQuery(options) {
    return (req) => {
        let args = objectToArgs(Object.assign({}, options.args, req.page))
        return `{
            ${options.name} ${args} {
                pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor }
                edges { node { ${options.fields} }}
            }
        }`
    }
}

module.exports = [
    {
        id: 'users',
        query: {
            read: listQuery({
                name: 'allUsers',
                fields: 'id, username',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allUsers.edges.map(e => e.node)
        },
    },
    {
        id: 'sections',
        query: {
            read: listQuery({
                name: 'allSections',
                fields: 'id, name, slug',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allSections.edges.map(e => e.node)
        },
    },
    {
        id: 'categories',
        query: {
            read: `{allCategories{edges{node{id,name}}}}`,
        },
        transform: {
            readResponseData: data => data.data.allCategories.edges.map(e => e.node)
        },
    },
    {
        id: 'tags',
        query: {
            read: listQuery({
                name: 'allTags',
                fields: 'id, name, slug',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allTags.edges.map(e => e.node)
        },
    },
    {
        id: 'entries',
        query: {
            read: listQuery({
                name: 'allEntries',
                fields: 'id, title, date, section{id, name}, category{id, name}',
                args: { first: 20, }
            }),
            create: `mutation ($input: CreateEntryInput!) {
                createEntry(input: $input) {
                    errors
                    entry {
                        id,
                        title,
                        section{id, name},
                        category{id, name},
                        date,
                    }
                }
            }`,
        },
        pagination,
        transform: {
            readResponseData: data => data.data.allEntries.edges.map(e => e.node),
            createResponseData: data => {
                if (data.data.createEntry.errors) {
                    throw data.data.createEntry.errors
                }
                return data.data.createEntry.entry
            },
        },
    },
    {
        id: 'entry',
        query: {
            read: `{entry(id: "%id"){id,title,date,section{id,name}},category{id,name}}}`,
            update: `mutation ($input: ChangeEntryInput!) {
                changeEntry(input: $input) {
                    errors
                    entry {
                        id,
                        title,
                        category { id, name }
                        date,
                    }
                }
            }`,
            delete: `mutation ($input: DeleteEntryInput!) {
                deleteEntry(input: $input) {
                    deleted
                    entry {
                        title
                    }
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.entry,
            updateResponseData: data => {
                if (data.data.changeEntry.errors) {
                    throw data.data.changeEntry.errors
                }
                return data.data.changeEntry.entry
            },
            deleteResponseData: data => data.data,
        }
    },
    {
        id: 'login',
        url: '/rest-api/login/',
        mapping: { read: 'post', },
        transform: {
            readResponseData: data => ({
                requestHeaders: { "Authorization": `Token ${data.token}` },
                authInfo: data,
            })
        }
    }
]
