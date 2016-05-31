# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200, verbose_name='Name')),
                ('slug', models.SlugField(max_length=100, verbose_name='Slug', blank=True)),
                ('position', models.PositiveIntegerField(null=True, verbose_name='Position', blank=True)),
                ('user', models.ForeignKey(related_name='categories', verbose_name=b'User', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'ordering': ('user', 'position'),
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Entry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200, verbose_name='Title')),
                ('date', models.DateField(verbose_name='Date')),
                ('date_from', models.DateTimeField(null=True, verbose_name='Date (online from)', blank=True)),
                ('date_until', models.DateTimeField(null=True, verbose_name='Date (online until)', blank=True)),
                ('sticky', models.BooleanField(default=False, verbose_name='Sticky')),
                ('status', models.CharField(default=b'0', max_length=1, verbose_name='Status', choices=[(b'0', 'Draft'), (b'1', 'Online')])),
                ('image', models.ImageField(null=True, upload_to=b'uploads/', blank=True)),
                ('body', models.TextField(max_length=3000, verbose_name='Body', blank=True)),
                ('createdate', models.DateField(auto_now_add=True, verbose_name='Date (Create)')),
                ('updatedate', models.DateField(auto_now=True, verbose_name='Date (Update)')),
                ('category', models.ForeignKey(related_name='entries', verbose_name='Category', to='blog.Category')),
            ],
            options={
                'ordering': ('-date',),
                'verbose_name': 'Entry',
                'verbose_name_plural': 'Entries',
            },
        ),
        migrations.CreateModel(
            name='EntryLink',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(max_length=250, verbose_name='URL')),
                ('title', models.CharField(max_length=250, verbose_name='Title')),
                ('description', models.CharField(max_length=250, verbose_name='Description', blank=True)),
                ('position', models.PositiveIntegerField(null=True, verbose_name='Position', blank=True)),
                ('entry', models.ForeignKey(related_name='links', verbose_name='Entry', to='blog.Entry')),
            ],
            options={
                'ordering': ('position',),
                'verbose_name': 'Link',
                'verbose_name_plural': 'Links',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200, verbose_name='Name')),
                ('slug', models.SlugField(max_length=100, verbose_name='Slug', blank=True)),
                ('user', models.ForeignKey(related_name='tags', verbose_name=b'User', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'ordering': ('user', 'slug'),
                'verbose_name': 'Tag',
                'verbose_name_plural': 'Tags',
            },
        ),
        migrations.AddField(
            model_name='entry',
            name='tags',
            field=models.ManyToManyField(related_name='entries', verbose_name='Tags', to='blog.Tag', blank=True),
        ),
        migrations.AddField(
            model_name='entry',
            name='user',
            field=models.ForeignKey(related_name='entries', verbose_name=b'User', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
