# Generated by Django 4.1.3 on 2023-01-28 11:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Whatsapp", "0004_rename_date_message_timestamp"),
    ]

    operations = [
        migrations.AddField(
            model_name="message", name="read", field=models.BooleanField(default=False),
        ),
    ]