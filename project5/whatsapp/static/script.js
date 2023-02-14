

document.addEventListener("DOMContentLoaded",()=>{
    search();
    chat_list();
    setInterval(function(){chat_list();},15000);
    const btn = document.querySelector("#search_btn");
    const input = document.querySelector("#search_contact");
    btn.disabled = true;

    input.onkeyup = ()=>{
        if (input.value.length > 0){
            btn.disabled = false;
        }
        else{
            btn.disabled = true;
        }
    }
    localStorage.setItem("click", null);
})
   
// Search both added contact and user in the app
function search(){
    document.querySelector("#search_btn").addEventListener("click",()=>{
        document.querySelector("#search_chat").innerHTML = "";
        let user = document.querySelector("#search_contact").value;
        document.querySelector("#search_contact").value = "";
        fetch(`search/${user}/`,{
            method: 'GET',
        })
        .then(response => response.json())
        .then(data =>{
            if (data["detail"] == null){
                let username = data.username;
                let action = "search";
                contact(username,action);
            }
        })
        document.querySelector("#current_chat").style.display = "none";
        document.querySelector("#search_chat").style.display ="block";
    })
}

// Default display of chat list 
function chat_list(){
    // Step 1: Check any unread message 
    document.querySelector("#current_chat").innerHTML ="";
    document.querySelector("#search_chat").innerHTML ="";
    let sender_lists = [];
    fetch("unread_message/")
    .then(response=>response.json())
    .then(data=>{
        for ( i = 0; i < data.length; i++){
            let sender = data[i].sender;
            let counter = 0;
            
            for ( j =0;j < sender_lists.length; j++){
                if (sender != sender_lists[j]){
                    counter++;
                    continue;
                }
                else
                    break;
            }
            
            if (counter == sender_lists.length || counter !=0){
                sender_lists.push(sender);
            }
        }
        fetch('chat/')
        .then(response=>response.json())
        .then(data =>{
            for (i =0; i < data.length; i++){
                let username = data[i].username;
                let action = "default";
                let status = false;
                for ( a =0; a < sender_lists.length; a++){
                    if (username == sender_lists[a]){
                        status = true;
                        break;
                    }
                    else
                        continue;
                }
            //check whether there is unread message 
                contact(username,action,status); 
            }
        })
    })  
}

var intervals =[];

function contact(username, action, status){

    let h4 = document.createElement("h4");
    let h6 = document.createElement("h6");
    let hr = document.createElement("hr");
    let contact_div = document.createElement("div");
    contact_div.className ="chat_contact";
    
    h6.style.padding ="10px";
    h6.style.display ="inline";
    h4.style.display ="inline";

    h4.innerHTML = "&#128050";
    h6.innerHTML = username; 

    contact_div.className = "chat_contact";
    contact_div.id =username;
    contact_div.style.height ="40px";
    contact_div.style.marginTop ="20px";

    if ( status == true ){
        contact_div.style.backgroundColor = "pink";
    }
    else{
        contact_div.style.backgroundColor ="white";
    }

    contact_div.appendChild(h4);
    contact_div.appendChild(h6);
    contact_div.addEventListener('click',()=>{
        //Read all unread message sent by the user
        read_message(username);
        contact_div.style.backgroundColor ="white";
        let chat_header = document.querySelector("#message_header")
        let chatbox = document.querySelector("#message_box");
        chatbox.innerHTML = "";
        chat_header.innerHTML ="";

        let h4 = document.createElement("h4");
        let h5 = document.createElement("h5");

        h5.style.padding ="10px";
        h5.style.display ="inline";
        h4.style.display ="inline";
        h4.style.marginLeft ="30px";

        h4.innerHTML = "&#128050";
        h5.innerHTML = username;

        chat_header.append(h4);
        chat_header.append(h5);
        all_message(username);
        send_message(username);
        intervals.forEach(clearInterval);
        let update = setInterval(()=>{all_message(username)},18000)
        intervals.push(update);
        localStorage.setItem("click",username);
    });

    if (action == "default"){
        document.querySelector("#current_chat").append(contact_div);
        document.querySelector("#current_chat").append(hr);
    }
    else if (action == "search" ){
        document.querySelector("#search_chat").append(contact_div);
        document.querySelector("#search_chat").append(hr);
    }
    
}


// Action determine whether is default loading or sent action
function all_message(username, action)
{
    
    if (action == "sent"){
        document.querySelector("#message_box").innerHTML ="";
        fetch(`message/${username}/`,{
            method: 'GET',
        })
        .then(response=>response.json())
        .then(data=>{
            individual_message(data);
            fetch(`message/${username}/`,{
                method: 'GET',
            })
            .then(response=>response.json())
            .then(data=>{
                let new_messages = data.length;
                let old_messages = localStorage.getItem(username);
                if (new_messages!=old_messages)
                    all_message(username);
                localStorage.setItem(username,new_messages);
            })
        })
    }
    if ( action == null ){
        document.querySelector("#message_box").innerHTML ="";
            fetch(`message/${username}/`,{
                method: 'GET',
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                individual_message(data);
            })

            // read unread message if chatbox is opened 
            read_message(username);
    }
}

function send_message(username){

     // Create Chatbox at the bottom 
     let chat_div = document.createElement("div")
     let chat = document.createElement("input");
     let chat_form = document.createElement("form");
 
     
     chat_div.style.bottom = "0.5%";
     chat_div.style.height = '6%';
     chat_div.style.width = '95%';
     chat_div.style.position ="absolute";
     
     chat_div.style.backgroundColor = "rgb(245, 245, 245)";
     chat_div.style.justifyContent ="center";
     chat_div.style.display ="flex";
 
     
     chat.style.border ="transparent";
     chat.style.borderRadius ="10px";
     chat.style.width ="80vh";

     chat.style.height = '70%';
     chat.style.marginTop="10px";
     chat.placeholder = "  Type a message...";
     
 
 // Add functionality to the chat 
     
 chat_form.onsubmit = ()=>{
 
 // Get csrf_token from meta
 var cookieValue = get_cookie();

     let chat_message = chat.value;
     let receiver = username;
     let sender = document.querySelector("#login_user").innerText;

     // Send text message
     fetch(`message/${username}/`,{
         method : "POST",
         headers :{
             "content-type": "application/json",
             'X-CSRFToken' : `${cookieValue}`,
         },
         body : JSON.stringify({
             sender: `${sender}`,
             receiver: `${receiver}`,
             message: `${chat_message}`,
         })
     })
     let action = "sent"
     all_message(username,action);
     chat.value="";
     return false;
     
 }
 
     chat_form.appendChild(chat)
     chat_div.appendChild(chat_form);   
     document.querySelector("#chat").append(chat_div);   
}



// Display each chat in the chat div
function individual_message(data){
    
    let number_of_message = data.length;
    if (number_of_message == null)
        number_of_message = 1;

    let message_content = data.message;
    let sender = data.sender;
    let timestamp = data.timestamp;
    let id = data.id;
    for (i =0; i < number_of_message; i++){
        
        if (data.length == null){
            message_content = data.message;
            sender = data.sender;
            timestamp = data.timestamp;
            id = data.id;
        }
        else{
             message_content = data[i].message;
             sender = data[i].sender;
             timestamp = data[i].timestamp;
             id = data[i].id;
        }
        console.log(message_content);
        const box = document.createElement("div");
        const message = document.createElement("div");
        const br = document.createElement("br");
        const h6 = document.createElement("h6");
        const p = document.createElement("p");
        const btn = document.createElement("button");


        box.className = "outer_message_box";
        message.className = "inner_message_box";

        p.style.fontSize ="15px";
        p.style.color = "rgb(160, 160, 160)";
        p.style.padding ="10px";
        h6.style.padding ="10px";

        box.style.width ="100%";
        box.style.padding ="50px";
        box.style.maxHeight ="100%";
        box.style.margin ="30px";
        box.style.marginTop ="-20px";
        box.style.marginBottom ="60px";

        message.style.width = "33%";
        message.style.borderRadius = "5px";


        // For Message deletion
        message.id =id;

        p.innerHTML = timestamp;
        h6.innerHTML = message_content;

    
        // Can only delete users' self message
        if (sender == document.querySelector("#login_user").innerText){
            message.style.backgroundColor = "#BFECB9";
            message.style.float="right";
            message.style.marginRight ="30px";

            let cookieValue = get_cookie();
            btn.style.width = "15%";
            btn.style.height ="5%";
            btn.style.top ="100%";
            btn.innerHTML = "-";
            btn.style.textAlign ="center";
            btn.style.float ="right";
            btn.style.backgroundColor ="transparent";
            btn.style.border = "0cm";


            btn.addEventListener("click",()=>{
                fetch(`delete/${message.id}/`,{
                    method: "DELETE",
                    headers :{
                        "content-type": "application/json",
                        'X-CSRFToken' : `${cookieValue}`,
                    },

                })
                .then(()=>{
                    message.style.backgroundColor = "rgb(200, 200, 200)";
                    h6.innerHTML ="Message has been deleted";
                })
            });
            message.appendChild(btn);
        }
        else{
            message.style.backgroundColor = "rgb(245, 245, 245)";
            message.style.float ="left";
        }

        message.appendChild(h6);
        message.appendChild(p);

        box.appendChild(message);
        document.querySelector("#message_box").append(box);
        document.querySelector("#message_box").append(br);
        
    }
    //Scroll to the bottom page 
    document.querySelector("#message_box").scrollTo(0,document.querySelector("#message_box").scrollHeight);
}


// Update message status 


function read_message(username){
    document.querySelector(`#${username}`).style.backgroundColor ="white";
    let cookieValue = get_cookie();
    fetch(`read_message/${username}/`,{
        method: "PUT",
        headers :{
            "content-type": "application/json",
            'X-CSRFToken' : `${cookieValue}`,
        },
        body : JSON.stringify({
           read : true,
        })
    })
}

// Get csrf_token from meta
function get_cookie(){
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, 9) == "csrftoken") {
                cookieValue = cookie.replace("csrftoken=","");
                break;
            }
        }
    }
    return cookieValue;
} 