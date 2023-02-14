from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from .models import User, Message
from .serializer import UserSerializer, MessageSerializer
from django.db import IntegrityError
from rest_framework import generics
from django.core.exceptions import ObjectDoesNotExist 
from datetime import datetime
import pytz


@login_required(login_url="login")
def index(request):
    return render(request, "whatsapp/index.html")

# Retrieve user info (search function )
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "username"

user_detail_view = UserDetailView.as_view()


# Retrieve all user info (chat list )
class UserListView(generics.ListAPIView):
    
    def get_queryset(self):
        return User.objects.all().exclude(username=self.request.user)
    
    serializer_class = UserSerializer

user_list_view = UserListView.as_view()


# For the chatbox
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    lookup_field ="username"
    def get_queryset(self):
            first_user = self.request.user
            second_user = User.objects.get(username=self.kwargs['username'])
            try: 
                messages = Message.objects.filter(sender=first_user,receiver=second_user)| Message.objects.filter(sender=second_user,receiver=first_user) 
            except ObjectDoesNotExist:
                pass
            return messages.order_by("timestamp")


    def post(self, request, *args, **kwargs):
        sender = User.objects.get(username= request.data.get('sender'))
        receiver = User.objects.get(username= request.data.get('receiver'))
        timestamp = datetime.now(tz=pytz.UTC)
        message = request.data.get('message')
        instance = Message(sender=sender,receiver=receiver,message=message,timestamp=timestamp)
        instance.save()
        return JsonResponse("Message Sent",safe=False)

message_list_create_view = MessageListCreateView.as_view()


# For the sent / receive message 
class MessageDetailView(generics.RetrieveAPIView):
    serializer_class = MessageSerializer
    queryset = Message.objects.all()
    lookup_field ="username"

    def get(self, request, *args, **kwargs):
        first_user = self.request.user
        second_user = User.objects.get(username=self.kwargs['username'])
        try: 
            messages = Message.objects.filter(sender=first_user,receiver=second_user)| Message.objects.filter(sender=second_user,receiver=first_user)
        except ObjectDoesNotExist:
            pass
        return JsonResponse(MessageSerializer(messages.order_by("-timestamp").first()).data)

  
message_detail_view = MessageDetailView.as_view()

########### For checking any unread messages ##########

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    def get_queryset(self):
        first_user = self.request.user
        try: 
            messages = Message.objects.filter(receiver=first_user,read = False) 
        except ObjectDoesNotExist:
            pass
        return messages

message_list_view = MessageListView.as_view()

#######  read message (set read : true ) #######
@login_required(login_url="login")
def update_message(request, **kwargs):
    if request.method == "PUT":
        user = request.user
        print(kwargs['username'])
        target = User.objects.get(username=kwargs['username'])

        try:
            messages = Message.objects.filter(sender=target, receiver=user,read=False)
            for message in messages:
                message.read = True
                message.save()
        except ObjectDoesNotExist:
            pass
    return JsonResponse("Fuck",safe=False)

# Delete Messages
class MessageDestroyView(generics.DestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    lookup_field ="pk"

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)

message_destroy_view = MessageDestroyView.as_view()



def login_view(request):
    if request.method =="POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request,username=username,password=password)

        if user is not None:
            login(request,user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "Whatsapp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "Whatsapp/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST['username']
        email = request.POST['email']

        password = request.POST['password']
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "Whatsapp/register.html",{
                "message": "Password must match"
            })

        try:
            user = User.objects.create_user(username, email,password)
            user.save()
        except IntegrityError:
            return render(request,"Whatsapp/register.html",{
                "message": "Username already taken."
            })
        login(request,user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "Whatsapp/register.html")
    

