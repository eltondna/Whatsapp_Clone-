# Generated by Django 4.1.3 on 2023-01-30 09:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Whatsapp", "0006_alter_message_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="message",
            name="id",
            field=models.IntegerField(
                auto_created=True, primary_key=True, serialize=False
            ),
        ),
    ]
