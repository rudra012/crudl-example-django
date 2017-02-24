# coding: utf-8

# PYTHON IMPORTS
import os
import unicodedata
import base64
import binascii

# REST IMPORTS
from rest_framework import serializers

# DJANGO IMPORTS
from django.core.files.base import ContentFile
from django.utils import six
from django.core.exceptions import ValidationError

ATTACHMENT_EXTENSIONS = [".png", ".jpg"]
ATTACHMENT_FILESIZE = "1048576"
ATTACHMENT_FILESIZE_STR = "1 MB"


class Base64FileField(serializers.FileField):
    """
    A django-rest-framework field for handling file-uploads through raw post data.
    It uses base64 for en-/decoding the contents of the file.

    Usage:

        class MySerializer(serializers.HyperlinkedModelSerializer):
            attachment = Base64FileField("attachment")

    By using a raw post data stream, we have to pass the filename:

        data_file = {
            "name": "myfilename.pdf"
            "file": "bas64encodedstring"
        }

    """
    def to_internal_value(self, data):
        if isinstance(data, dict) and "name" in data and "file" in data:
            base64_data = data["file"]
            if isinstance(base64_data, six.string_types):
                if not isinstance(data["name"], unicode) or isinstance(data["name"], str):
                    raise ValidationError(u"Invalid name.")
                elif not os.path.splitext(data["name"])[1].lower() in ATTACHMENT_EXTENSIONS:
                    raise ValidationError(u"Invalid extension.")
                elif len(data["name"]) > 50:
                    raise ValidationError(u"Invalid name length.")
                elif len(data["file"]) * 3 / 4 > ATTACHMENT_FILESIZE:
                    raise ValidationError(u"File is too large. Max. Filesize is %s." % ATTACHMENT_FILESIZE_STR)
                # Try to decode the file. Return validation error if it fails.
                try:
                    decoded_file = base64.b64decode(base64_data)
                except (TypeError, binascii.Error):
                    raise ValidationError("Please upload a valid file.")

                data = ContentFile(decoded_file, name=data["name"])
                return super(Base64FileField, self).to_internal_value(data)
            else:
                raise ValidationError('This is not an base64 string')
        elif isinstance(data, basestring):
            if len(data) > 0:
                return data
            return None
        else:
            raise ValidationError(u"Invalid value.")

    def to_representation(self, value):
        if value:
            return {'name': self.get_filename(value), 'url': value.url}
        return {}

    def get_filename(self, value):
        if value:
            val = u"%s" % os.path.split(value.path)[1]
            return unicodedata.normalize("NFC", val)
        return None
