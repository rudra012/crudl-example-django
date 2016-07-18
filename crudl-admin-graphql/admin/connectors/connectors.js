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
        let args = objectToArgs(Object.assign({}, options.args, req.page, req.filters))
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
                fields: 'id, originalId, username, firstName, lastName, email, isActive, isStaff, dateJoined'
            }),
        },
        transform: {
            readResponseData: data => data.data.allUsers.edges.map(e => e.node)
        },
    },
    {
        id: 'user',
        query: {
            read: `{user(id: "%id"){id,username,firstName,lastName,email,isStaff,isActive,dateJoined}}`,
            update: `mutation ($input: ChangeSectionInput!) {
                changeSection(input: $input) {
                    errors
                    section {id,name,slug,position}
                }
            }`,
            delete: `mutation ($input: DeleteSectionInput!) {
                deleteSection(input: $input) {
                    deleted
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.user,
            updateResponseData: data => {
                if (data.data.changeUser.errors) {
                    throw data.data.changeUser.errors
                }
                return data.data.changeUser.section
            },
            deleteRequestData: data => ({ id: data.id }),
            deleteResponseData: data => data.data,
        }
    },

    // SECTIONS
    {
        id: 'sections',
        query: {
            read: listQuery({
                name: 'allSections',
                fields: 'id, originalId, name, slug, position, counterEntries',
                args: { first: 20, orderBy: "name" }
            }),
            create: `mutation ($input: CreateSectionInput!) {
                createSection(input: $input) {
                    errors
                    section {id,name,slug,position}
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.allSections.edges.map(e => e.node),
            createResponseData: data => {
                if (data.data.createSection.errors) {
                    throw data.data.createSection.errors
                }
                return data.data.createSection.section
            },
        },
    },
    {
        id: 'section',
        query: {
            read: `{section(id: "%id"){id,name,slug,position}}`,
            update: `mutation ($input: ChangeSectionInput!) {
                changeSection(input: $input) {
                    errors
                    section {id,name,slug,position}
                }
            }`,
            delete: `mutation ($input: DeleteSectionInput!) {
                deleteSection(input: $input) {
                    deleted
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.section,
            updateResponseData: data => {
                if (data.data.changeSection.errors) {
                    throw data.data.changeSection.errors
                }
                return data.data.changeSection.section
            },
            deleteRequestData: data => ({ id: data.id }),
            deleteResponseData: data => data.data,
        }
    },

    // CATEGORIES
    {
        id: 'categories',
        query: {
            read: listQuery({
                name: 'allCategories',
                fields: 'id,originalId,section{id,name},name,slug,position,counterEntries',
                args: { first: 20, orderBy: "name" }
            }),
            create: `mutation ($input: CreateCategoryInput!) {
                createCategory(input: $input) {
                    errors
                    category {id,section{id,name},name,slug,position}
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.allCategories.edges.map(e => e.node),
            createResponseData: data => {
                if (data.data.createCategory.errors) {
                    throw data.data.createCategory.errors
                }
                return data.data.createCategory.category
            },
        },
    },
    {
        id: 'category',
        query: {
            read: `{category(id: "%id"){id,section{id,name},name,slug,position}}`,
            update: `mutation ($input: ChangeCategoryInput!) {
                changeCategory(input: $input) {
                    errors
                    category {id,section{id,name},name,slug,position}
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.category,
            updateResponseData: data => {
                if (data.data.changeCategory.errors) {
                    throw data.data.changeCategory.errors
                }
                return data.data.changeCategory.category
            },
            deleteRequestData: data => ({ id: data.id }),
            deleteResponseData: data => data.data,
        }
    },

    // TAGS
    {
        id: 'tags',
        query: {
            read: listQuery({
                name: 'allTags',
                fields: 'id, originalId, name, slug, counterEntries',
                args: { first: 20, orderBy: "name" }
            }),
            create: `mutation ($input: CreateTagInput!) {
                createTag(input: $input) {
                    errors
                    tag {id,name,slug}
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.allTags.edges.map(e => e.node),
            createResponseData: data => {
                if (data.data.createTag.errors) {
                    throw data.data.createTag.errors
                }
                return data.data.createTag.tag
            },
        },
    },
    {
        id: 'tag',
        query: {
            read: `{tag(id: "%id"){id,name,slug}}`,
            update: `mutation ($input: ChangeTagInput!) {
                changeTag(input: $input) {
                    errors
                    tag {id,name,slug}
                }
            }`,
        },
        transform: {
            readResponseData: data => data.data.tag,
            updateResponseData: data => {
                if (data.data.changeTag.errors) {
                    throw data.data.changeTag.errors
                }
                return data.data.changeTag.tag
            },
            deleteRequestData: data => ({ id: data.id }),
            deleteResponseData: data => data.data,
        }
    },

    // ENTRIES
    {
        id: 'entries',
        query: {
            read: listQuery({
                name: 'allEntries',
                fields: 'id, originalId, title, status, date, section{id, name}, category{id, name}, owner{id, username}, counterLinks, counterTags',
                args: { first: 20, orderBy: "title" }
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
            deleteRequestData: data => ({ id: data.id }),
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
                    return { value: item.node.id, label: item.node.name }
                }),
            })
        },
    },

    // category_options
    // a helper for retrieving the categories used with select fields
    {
        id: 'categories_options',
        query: {
            read: `{allCategories{edges{node{id,name}}}}`,
        },
        transform: {
            readResponseData: data => ({
                options: data.data.allCategories.edges.map(function(item) {
                    return { value: item.node.id, label: item.node.name }
                }),
            })
        },
    },

    // tags_options
    // a helper for retrieving the tags used with select fields
    {
        id: 'tags_options',
        query: {
            read: `{allTags{edges{node{id,name}}}}`,
        },
        transform: {
            readResponseData: data => ({
                options: data.data.allTags.edges.map(function(item) {
                    return { value: item.node.id, label: item.node.name }
                }),
            })
        },
    },

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
