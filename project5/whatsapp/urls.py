from django.urls import path
from . import views


urlpatterns =[
    path("",views.index,name="index"),
    path("chat/",views.user_list_view,name="chat_list"),
    path("search/<str:username>/",views.user_detail_view),
    path("message/<str:username>/",views.message_list_create_view),
    path("unread_message/",views.message_list_view),
    path("read_message/<str:username>/", views.update_message),
    path("i_message/<str:username>/",views.message_detail_view),
    path("delete/<int:pk>/", views.message_destroy_view),
    
    path('login',views.login_view,name="login"),
    path('logout',views.logout_view,name="logout"),
    path('register',views.register,name="register"),

]