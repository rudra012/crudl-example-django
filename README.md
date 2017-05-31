# CRUDL django example
This is a [CRUDL](http://crudl.io/) example with [Django](https://www.djangoproject.com/), [DRF](http://www.django-rest-framework.org/) (REST), [Graphene](http://graphene-python.org/) (GraphQL) and [SQLite](https://www.sqlite.org/).

* CRUDL is still under development and the syntax might change (esp. with connectors and views).
* The relevant part for your admin interface is within the folder crudl-admin-rest/admin/ (resp. crudl-admin-graphql/admin/). All other files and folders are usually given when using CRUDL.
* The views are intentionally verbose in order to illustrate the possibilites with CRUDL.

## Contents
* [Requirements](#requirements)
* [Installation](#installation)
    * [Installation (REST)](#installation-rest)
    * [Installation (GraphQL)](#installation-graphql)
* [CRUDL documentation](#crudl-documentation)
* [Interface](#interface)
* [Connectors & Views](#connectors--views)
    * [Connectors](#connectors)
    * [Views](#views)
* [Notes](#notes)
    * [Authentication](#authentication)
    * [Field dependency](#field-dependency)
    * [Foreign Key, Many-to-Many](#foreign-key-many-to-many)
    * [Relation with different endpoint](#relation-with-different-endpoint)
    * [Normalize/denormalize](#normalizedenormalize)
    * [Custom components](#custom-components)
    * [Initial values](#initial-values)
    * [Validate fields and form](#validate-fields-and-form)
    * [Custom column with listView](#custom-column-with-listview)
    * [Multiple sort with listView](#multiple-sort-with-listview)
    * [Filtering with listView](#filtering-with-listview)
    * [Change password](#change-password)
* [Limitations](#limitations)
* [Credits & Links](#credits--links)

## Requirements
* Node.js 5+
* Python 2.7
* virtualenv
* SQLite

## Installation
In order to use this example, you need to setup the API and serve the CRUDL admin interface (either REST or GraphQL or both).

### Installation (REST)
1. Create and activate a python virtual environment.

    ```shell
    $ virtualenv crudlexample
    $ source crudlexample/bin/activate
    ```

2. Clone this repository and cd into the new folder:

    ```shell
    (crudlexample) $ git clone https://github.com/crudlio/crudl-example-django.git
    (crudlexample) $ cd crudl-example-django
    ```

3. Install the python requirements:

    ```shell
    (crudlexample) crudl-example-django $ pip install -r conf/requirements.txt
    ```

4. Setup the database (SQLite) and add contents:

    ```shell
    (crudlexample) crudl-example-django $ python manage.py migrate
    (crudlexample) crudl-example-django $ python manage.py loaddata apps/blog/fixtures/blog.json
    ```

5. Start the django development server:

    ```shell
    (crudlexample) crudl-example-django $ python manage.py runserver
    ```

6. Open a new terminal window/tab and build the CRUDL admin file. Go to /crudl-admin-rest/ and type:

    ```shell
    (crudlexample) crudl-admin-rest $ npm install --no-optional
    (crudlexample) crudl-admin-rest $ npm run watchify
    ```

7. Open your browser, go to ``http://localhost:8000/crudl-rest/`` and login with the demo user (demo/demo).

### Installation (GraphQL)
Steps 1 to 5 are equal to [Installation (REST)](#installation-rest).

6. Open a new terminal window/tab and build the CRUDL admin file. Go to /crudl-admin-graphql/ and type:

    ```shell
    (crudlexample) crudl-admin-graphql $ npm install --no-optional
    (crudlexample) crudl-admin-graphql $ npm run watchify
    ```

7. Open your browser, go to ``http://localhost:8000/crudl-graphql/`` and login with the demo user (demo/demo).

## CRUDL documentation
https://github.com/crudlio/crudl

## Interface
What you get with CRUDL is an administration interface which consists of these elements:

**Dashboard**
* The main entry page (currently just contains a description).

**listView** (per ressource)
* A sortable table with all objects per ressource.
* The objects are usually paginated (either numbered or continuous).
* Includes a sidebar with search and filters.

**change/addView** (per object)
* The form (fields and fieldsets) for adding/updating an object.
* Optionally with tabs for complex relations (e.g. links with entries).

Moreover, you'll have a **Menu/Navigation** (on the left hand side), a **Login/Logout** page and **Messages**.

## Notes
While this example is simple, there's still a couple of more advanced features in order to represent a real-world scenario.

## Connectors & Views
In order for CRUDL to work, you mainly need to define _connectors_ and _views_.

### Connectors
The _connectors_ provide the views with a unified access to different APIs like REST or GraphQL. Each _connector_ usually represents a single API endpoint (or query) and implements the CRUD methods (create, read, update, delete). Moreover, the _connector_ handles pagination and transforms the request/response.

There is a npm package implementing general connectors [crudl-connectors-base](https://github.com/crudlio/crudl-connectors-base) that can be extended (using middleware) to fit your particular needs. We also provide a Django Rest Framework (DRF) connectors package that does most of the heavy lifting for you [crudl-connectors-drf](https://github.com/crudlio/crudl-connectors-drf).

Usage examples of DRF connectors:
```js
import { createDRFConnector, defaults } from 'crudl-connectors-drf'
import { numberedPagination } from 'crudl-connectors-drf/lib/middleware'

defaults.baseURL = '/rest-api/'

const list = createDRFConnector(':collection/').use(numberedPagination())
const entries = list('entries')
const users = list('users')

entries.read(crudl.req()) // list all entries (results are paginated)
users.read(crudl.req()) // list all users (results are paginated)
```

### Views
With views, you create the visual representation by defining the _listView_, _changeView_ and _addView_ options:

```js
var listView = {
    // Required
    path: "api/path/to/collection",
    title: "Collection Name",
    actions: {
        list: listConnector.read,
    }
    fields: [],
    // Optional
    filters: [],
    normalize: (data) => { },
}

var changeView = {
    // Required
    path: "api/path/to/collection/:id",
    title: "Detail Name",
    actions: {
        get: req => detailConnector(crudl.path.id).read(req),
        save: req => detailConnector(crudl.path.id).update(req),
        delete: req => detailConnector(crudl.path.id).delete(req),
    },
    // Either fields or fieldsets
    fields: [],
    fieldsets: [],
    // Optional
    tabs: [],
    normalize: (data) => { },
    denormalize: (data) => { },
    validate: function (values) { },
}
```

### Authentication
Both the REST and GraphQL API is only accessible for logged-in users based on TokenAuthentication. Besides the Token, we also return an attribute _info_ in order to subsequently have access to the currently logged-in user (e.g. for filtering). The _info_ is exposed in the global variable `crudl.auth`.

The REST login [connector](crudl-admin-rest/admin/connectors.js) looks like this:
```js
const login = createDRFConnector('login/')
.use(transformData('create',
    data => ({
        requestHeaders: { "Authorization": `Token ${data.token}` },
        info: data,
    })
))
```
And is used like this:

### Field dependency
With _Entries_, the _Categories_ depend on the selected _Section_. If you change the field _Section_, the options of field _Category_ are populated based on the chosen _Section_ due to the _onChange_ method.

```js
{
    name: 'category',
    field: 'Autocomplete',
    onChange: [
        {
            in: 'section',
            setProps: (section) => {
                if (!section.value) {
                    return {
                        readOnly: true,
                        helpText: 'In order to select a category, you have to select a section first',
                    }
                }
                return options('catogories', 'id', 'name')
                .read(crudl.req().filter('section', section.value))
                .then(({ options }) => {
                    if (options.length > 0) {
                        return {
                            readOnly: false,
                            helpText: 'Select a category',
                            options,
                        }
                    } else {
                        return {
                            readOnly: true,
                            helpText: 'No categories available for the selected section.'
                        }
                    }
                })
            }
        }
    ],
}
```

You can use the same syntax with list filters (see [entries.js](crudl-admin-rest/admin/views/entries.js) for example).

### Foreign Key, Many-to-Many
There are a couple of foreign keys being used (e.g. _Section_ or _Category_ with _Entry_) and one many-to-many field (_Tags_ with _Entry_).

```js
{
    name: 'section',
    label: 'Section',
    field: 'Select',
    lazy: () => options('sections', 'id', 'name').read(crudl.req()),
},
{
    name: 'category',
    label: 'Category',
    field: 'Autocomplete',
    actions: {
        select: req => options('categories', 'id', 'name')
            .read(req.filter('id_in', req.data.selection.map(item => item.value).toString()))
            .then(({ options }) => options),
        search: (req) => {
            return options('categories', 'id', 'name')
            .read(req.filter('name', req.data.query).filter('section', crudl.context('section')))
            .then(({ options }) => options)
        },
    },
},
{
    name: 'tags',
    label: 'Tags',
    field: 'AutocompleteMultiple',
    required: false,
    showAll: false,
    helpText: 'Select a tag',
    actions: {
        search: (req) => {
            return options('tags', 'id', 'name')
            .read(req.filter('name', req.data.query.toLowerCase()))
            .then(({ options }) => options)
        },
        select: (req) => {
            return options('tags', 'id', 'name')
            .read(req.filter('id_in', req.data.selection.map(item => item.value).toString()))
            .then(({ options }) => options)
        },
    },
}
```

### Relation with different endpoint
The descriptor _Links_ is an example of related objects which are assigned through an intermediary table with additional fields.

```js
changeView.tabs = [
    {
        title: 'Links',
        actions: {
            list: req => links.read(req.filter('entry', crudl.path.id)),
            add: req => links.create(req),
            save: req => link(req.data.id).update(req),
            delete: req => link(req.data.id).delete(req),
        },
        itemTitle: '{url}',
        fields: [
            {
                name: 'url',
                label: 'URL',
                field: 'URL',
                link: true,
            },
            {
                name: 'title',
                label: 'Title',
                field: 'String',
            },
            {
                name: 'id',
                hidden: true,
            },
            {
                name: 'entry',
                hidden: true,
                initialValue: () => crudl.context('id'),
            },
        ],
    },
]
```

### Normalize/denormalize
With _Entries_, we set the owner to the currently logged-in user with denormalize:

```js
var addView = {
    denormalize: (data) => {
        /* set owner on add. alternatively, we could manipulate the data
        with the connector by using createRequestData */
        if (crudl.auth.user) data.owner = crudl.auth.user
        return data
    }
}
```

With _Users_, we add a custom column full_name with the listView:

```js
var listView = {
    normalize: (list) => list.map(item => {
        item.full_name = <span><b>{item.last_name}</b>, {item.first_name}</span>
        return item
    })
}
```

### Custom components
We have added a custom component _SplitDateTimeField.jsx_ (see admin/fields) in order to show how you're able to implement fields which are not part of the core package.

```js
import options from './admin/options'
import descriptor from './admin/descriptor'
import SplitDateTimeField from './admin/fields/SplitDateTimeField'

crudl.addField('SplitDateTime', SplitDateTimeField)
crudl.render(descriptor, options)
```

### Initial values
You can set initial values with every field (based on context, if needed).

```js
{
    name: 'date',
    label: 'Date',
    field: 'Date',
    initialValue: () => formatDate(new Date())
},
{
    name: 'entry',
    hidden: true,
    initialValue: () => crudl.context('id'),
},
```

### Validate fields and form
Validation should usually be handled with the API. That said, it sometimes makes sense to use frontend validation as well.

```js
{
    name: 'date_gt',
    label: 'Published after',
    field: 'Date',
    /* simple date validation */
    validate: (value, allValues) => {
        const dateReg = /^\d{4}-\d{2}-\d{2}$/
        if (value && !value.match(dateReg)) {
            return 'Please enter a date (YYYY-MM-DD).'
        }
    }
},
{
    name: 'summary',
    label: 'Summary',
    field: 'Textarea',
    validate: (value, allValues) => {
        if (!value && allValues.status == '1') {
            return 'The summary is required with status "Online".'
        }
    }
},
```

In order to validate the complete form, you define a function _validate_ with the _changeView_ or _addView_:

```js
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    actions: { ... },
    validate: function (values) {
        if (!values.category && !values.tags) {
            return { _error: 'Either `Category` or `Tags` is required.' }
        }
    }
}
```

### Custom column with listView
With _Entries_, we added a custom column to the _listView_ based on the currently logged-in user.

```js
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        /* here we add a custom column based on the currently logged-in user */
        list: req => entries.read(req).then(data => data.map((item) => {
            item.is_owner = crudl.auth.user === item.owner
            return item
        })),
    },
}

listView.fields = [
    { ... }
    {
        name: 'is_owner',
        label: 'Owner',
        render: 'boolean',
    },
]
```

### Multiple sort with listView
The _listView_ supports ordering by multiple columns (see entries.js).

### Filtering with listView
Filtering is done by defining fields with _listView.filters_ (see entries.js). You have all the options available with the _changeView_ (e.g. initial values, field dependency, autocompletes, ...).

### Change password
You can only change the password of the currently logged-in _User_ (see views/users.js)

## Limitations
* Ordering by multiple fields is currently not possible with GraphQL due to in issue with Graphene (see https://github.com/graphql-python/graphene/issues/218).

## Credits & Links
CRUDL and crudl-example-django is written and maintained by vonautomatisch (Patrick Kranzlmüller, Axel Swoboda, Václav Pfeifer-Mikolášek).

* http://crudl.io
* https://twitter.com/crudlio
* http://vonautomatisch.at
