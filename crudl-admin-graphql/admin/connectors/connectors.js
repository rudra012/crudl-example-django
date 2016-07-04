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

    // USERS
    {
        id: 'users',
        query: {
            read: listQuery({
                name: 'allUsers',
                fields: 'id, originalId, username',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allUsers.edges.map(e => e.node)
        },
    },

    // SECTIONS
    {
        id: 'sections',
        query: {
            read: listQuery({
                name: 'allSections',
                fields: 'id, originalId, name, slug',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allSections.edges.map(e => e.node)
        },
    },
    {
        id: 'section',
        query: {
            read: `{section(id: "%id"){id,name,slug,position}}`,
        },
        transform: {
            readResponseData: data => data.data.section
        }
    },

    // CATEGORIES
    {
        id: 'categories',
        query: {
            read: `{allCategories{edges{node{id,originalId,section{id,name},name,slug,position}}}}`,
        },
        transform: {
            readResponseData: data => data.data.allCategories.edges.map(e => e.node)
        },
    },
    {
        id: 'category',
        query: {
            read: `{category(id: "%id"){id,section{id,name},name,slug,position}}`,
        },
        transform: {
            readResponseData: data => data.data.category
        }
    },

    // TAGS
    {
        id: 'tags',
        query: {
            read: listQuery({
                name: 'allTags',
                fields: 'id, originalId, name, slug',
                args: { first: 20, }
            }),
        },
        transform: {
            readResponseData: data => data.data.allTags.edges.map(e => e.node)
        },
    },
    {
        id: 'tag',
        query: {
            read: `{tag(id: "%id"){id,name,slug}}`,
        },
        transform: {
            readResponseData: data => data.data.tag
        }
    },

    // ENTRIES
    {
        id: 'entries',
        query: {
            read: listQuery({
                name: 'allEntries',
                fields: 'id, originalId, title, date, section{id, name}, category{id, name}, owner{id, username}',
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

    // ENTRYLINKS

    // SPECIAL CONNECTORS

    // sections_options
    // a helper for retrieving the sections used with select fields
    {
        id: 'sections_options',
        query: {
            read: `{allSections{edges{node{id,name}}}}`,
        },
        transform: {
            readResponseData: data => ({
                options: data.data.allSections.edges.map(function(item) {
                    console.log(item)
                    return { value: item.node.id, label: item.node.name }
                }),
            })
        },
    },

    // category_options
    // a helper for retrieving the categories used with select fields
    // {
    //     id: 'categories_options',
    //     url: 'categories/',
    //     transform: {
    //         readResponseData: data => ({
    //             options: data.results.map(function(item) {
    //                 return { value: item.id, label: item.name }
    //             }),
    //         })
    //     },
    // },

    // tags_options
    // a helper for retrieving the tags used with select fields
    // {
    //     id: 'tags_options',
    //     url: 'tags/',
    //     transform: {
    //         readResponseData: data => ({
    //             options: data.results.map(function(item) {
    //                 return { value: item.id, label: item.name }
    //             }),
    //         })
    //     },
    // },

    // AUTHENTICATION
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
