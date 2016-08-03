# coding: utf-8

# GRAPHENE IMPORTS
import graphene

# PROJECT IMPORTS
import apps.blog.schema


class Query(apps.blog.schema.Query):
    pass


class Mutation(apps.blog.schema.Mutation):
    pass


schema = graphene.Schema(name='Blog Schema')
schema.query = Query
schema.mutation = Mutation
