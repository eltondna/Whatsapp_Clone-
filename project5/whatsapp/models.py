from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.


class User(AbstractUser):
    pass

class Message(models.Model):
    id = models.IntegerField(primary_key=True,auto_created=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE,related_name="message_sender")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE,related_name="message_receiver")
    message = models.TextField(null=False)
    timestamp = models.DateTimeField()
    read = models.BooleanField(default=False)




