# Generated by Django 4.1.3 on 2023-01-28 11:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("Whatsapp", "0003_message"),
    ]

    operations = [
        migrations.RenameField(
            model_name="message", old_name="date", new_name="timestamp",
        ),
    ]
