# crudl django example
This is a [crudl](http://crudl.io/) example with [Django](https://www.djangoproject.com/) and [DRF](http://www.django-rest-framework.org/) for the REST-API as well as [Graphene](http://graphene-python.org/) for GraphQL.

## Installation
1. Create and activate a python **virtual environment**.

2. Clone this repository and cd into the new folder:

    ```
    $ git clone https://github.com/crudlio/crudl-example-django.git
    $ cd crudl-example-django
    ```

3. Then, install the python requirements:

    ```
    $ pip install -r conf/requirements.txt
    ```

4. Now you can setup the database (SQLite) and add some contents:

    ```
    $ python manage.py migrate  
    $ fab init -f conf/fabfile
    ```

    You have now 3 superusers (patrick, axel, vaclav) with pw "crudl" for each one.
    Besides, you'll get lots of categories, tags and some blog entries.

5. Start the django development server:

    ```
    $ python manage.py runserver
    ```

Now you can open your browser and go to ``http://localhost:8000/crudl-rest/`` and login with one of the superusers.

Install crudl-admin (REST)
--------------------------
Go to /crudl-admin-rest/ and install the npm packages, then run watchify:
```
$ npm install
$ npm run watchify
```

Install crudl-admin (GraphQL)
-----------------------------
Go to /crudl-admin-graphql/ and install the npm packages, then run watchify:
```
$ npm install
$ npm run watchify
```

## URLs
```
/api/               # REST API (DRF)
/graphiql/          # GraphQL Query Interface
/admin/             # Django Admin (Grappelli)
/crudl-rest/        # Crudl Admin (REST)
/crudl-graphql/     # Crudl Admin (GraphQL)
```

## Notes
While this example is simple, there's still a couple of more advanced features in order to represent a real-world scenario.

### Authentication
Both the REST and GraphQL API is only accessible for logged-in users based on TokenAuthentication.
Authentication for GraphQL is done with a decorator wrapping the basic URL.

### Mutually dependent fields
When adding or editing an Entry, the Categories depend on the selected User.
If you change the field User, the options of field Category is populated based on the chosen User.

### Foreign Key, Many-to-Many
There are a couple of foreign keys being used (e.g. Category with Entry) and one many-to-many field (Tags with Entry).

### Relation with different endpoint
The collection Links is an example of related objects which are assigned through an intermediary table with additional fields.
You can either use the main menu in order to handle all Links are an individual Entry in order to XXX (which are shown using tabs).

### Autocompletes
We decided to use autocomplete fields for all foreign-key and many-to-many relations.
XXX

### Custom fields
With Users, we added a custom field Name which is not part of the database or the API.
