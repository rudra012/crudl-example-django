# coding: utf-8

# GRAPHENE IMPORTS
import graphene

# PROJECT IMPORTS
import apps.blog.schema


class Query(apps.blog.schema.Query):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass


class Mutation(apps.blog.schema.Mutation):
    pass

schema = graphene.Schema(name='Blog Schema')
schema.query = Query
schema.mutation = Mutation
