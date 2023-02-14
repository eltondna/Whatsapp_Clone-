from rest_framework import serializers
from .models import User,Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =[
            "id",
            "username",
            "email",
        ]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField(read_only=True)
    receiver = serializers.SerializerMethodField(read_only=True)
    timestamp = serializers.SerializerMethodField(read_only=True)
    id = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Message
        fields=[
            "id",
            "sender",
            "receiver",
            "message",
            "timestamp",
            "read",
        ]

    def get_id(self,obj):
        return obj.id

    def get_sender(self,obj):
        return obj.sender.username 

    def get_receiver(self,obj):
        return obj.receiver.username
    
    def get_timestamp(self,obj):
        return obj.timestamp.strftime("%b %d %Y, %I:%M %p")