# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('slug', models.SlugField(max_length=100, verbose_name='Slug', blank=True)),
                ('position', models.PositiveIntegerField(null=True, verbose_name='Position', blank=True)),
            ],
            options={
                'ordering': ('section', 'name'),
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Entry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200, verbose_name='Title')),
                ('status', models.CharField(default=b'0', max_length=1, verbose_name='Status', choices=[(b'0', 'Draft'), (b'1', 'Online')])),
                ('date', models.DateField(verbose_name='Date')),
                ('sticky', models.BooleanField(default=False, verbose_name='Sticky')),
                ('image', models.ImageField(null=True, upload_to=b'uploads/', blank=True)),
                ('summary', models.TextField(max_length=500, verbose_name='Summary', blank=True)),
                ('body', models.TextField(verbose_name='Body', blank=True)),
                ('locked', models.BooleanField(default=False, verbose_name='Sticky')),
                ('createdate', models.DateTimeField(auto_now_add=True, verbose_name='Date (Create)')),
                ('updatedate', models.DateTimeField(auto_now=True, verbose_name='Date (Update)')),
                ('category', models.ForeignKey(related_name='entries', verbose_name='Category', blank=True, to='blog.Category', null=True)),
            ],
            options={
                'ordering': ('-sticky', '-date'),
                'verbose_name': 'Entry',
                'verbose_name_plural': 'Entries',
            },
        ),
        migrations.CreateModel(
            name='EntryLink',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(verbose_name='URL')),
                ('title', models.CharField(max_length=200, verbose_name='Title')),
                ('description', models.CharField(max_length=200, verbose_name='Description', blank=True)),
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
            name='Section',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('slug', models.SlugField(max_length=100, verbose_name='Slug', blank=True)),
                ('position', models.PositiveIntegerField(null=True, verbose_name='Position', blank=True)),
            ],
            options={
                'ordering': ('name',),
                'verbose_name': 'Section',
                'verbose_name_plural': 'Sections',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('slug', models.SlugField(max_length=100, verbose_name='Slug', blank=True)),
            ],
            options={
                'ordering': ('name',),
                'verbose_name': 'Tag',
                'verbose_name_plural': 'Tags',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('username', models.CharField(error_messages={b'unique': b'A user with that username already exists.'}, max_length=30, validators=[django.core.validators.RegexValidator(b'^[\\w.@+-]+$', b'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', b'invalid')], help_text=b'Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', unique=True, verbose_name='Username')),
                ('password', models.CharField(max_length=128, verbose_name='Password')),
                ('first_name', models.CharField(max_length=30, verbose_name='First name', blank=True)),
                ('last_name', models.CharField(max_length=30, verbose_name='Last name', blank=True)),
                ('email', models.EmailField(max_length=254, verbose_name='Email', blank=True)),
                ('is_staff', models.BooleanField(default=False, verbose_name='is_staff')),
                ('is_active', models.BooleanField(default=True, verbose_name='is_active')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='Date (Joined)')),
                ('token', models.CharField(max_length=40, verbose_name='Token', blank=True)),
            ],
            options={
                'ordering': ('id',),
                'verbose_name': 'User',
                'verbose_name_plural': 'Users',
            },
        ),
        migrations.AddField(
            model_name='entry',
            name='owner',
            field=models.ForeignKey(related_name='entries', verbose_name='User', blank=True, to='blog.User', null=True),
        ),
        migrations.AddField(
            model_name='entry',
            name='section',
            field=models.ForeignKey(related_name='entries', verbose_name='Section', to='blog.Section'),
        ),
        migrations.AddField(
            model_name='entry',
            name='tags',
            field=models.ManyToManyField(related_name='entries', verbose_name='Tags', to='blog.Tag', blank=True),
        ),
        migrations.AddField(
            model_name='category',
            name='section',
            field=models.ForeignKey(related_name='categories', verbose_name='Section', to='blog.Section'),
        ),
    ]
