jQuery.each( [ "put", "delete" ], function( i, method ) {
    jQuery[ method ] = function( url, data, callback, type ) {
        if ( jQuery.isFunction( data ) ) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});

$(function () {
    var currentUser = 1,
        email = 'test@email.com',
        setDate = function (item) {
            var detectDate;
            if(item.updated_at.length){
                detectDate = new Date(item.updated_at);
            }
            else{
                detectDate = new Date(item.created_at);
            }
            var year = detectDate.getFullYear(),
                month = detectDate.getMonth()+1,
                day = detectDate.getDate(),
                hours = detectDate.getHours(),
                minutes = detectDate.getMinutes();

            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            return '<span>' + year + '-' + month + '-' + day + '</span> at <span>' + hours + ':' + minutes + '</span>';

        },
        messagesNumber = 5,
        messagesOffset = 0,
        messageList = $('[data-message="list"]'),
        parentMessageTemplate = function(object){
            var author = object.author,
                message = object.content,
                currentDate = setDate(object);


            if( author.id == currentUser ){
                $('#current-user__avatar').attr('src', author.avatar);
                $('.post-comments__personal').attr('data-user', currentUser);
            }

            // console.log(author);
            var parent = messageList;
            var replyBlock;
            if( author.id == currentUser ){
                replyBlock = '<div class="post-comments__info_item post-comments__control-block">' +
                    '<span class="post-comments__control" data-message="edit"><i class="fas fa-edit"></i>Edit</span>' +
                    '<span class="post-comments__control" data-message="delete"><i class="fas fa-times"></i>Delete</span>' +
                    '<span class="post-comments__control" data-message="reply"><i class="fas fa-reply"></i>Reply</span>' +
                    '</div>'
            }
            else{
                replyBlock = '<div class="post-comments__info_item post-comments__control"><span data-message="reply"><i class="fas fa-reply"></i>Reply</span></div>';
            }

            parent.append(
                '<div id="' + object.id + '" class="post-comments__item" data-author="' + author.id + '">' +
                '<div class="post-comments__info_wrapper" data-info>' +
                '<div class="post-comments__avatar">' +
                '<img class="user__avatar" src="' + author.avatar + '">' +
                '</div>' +
                '<div class="post-comments__info">' +
                '<div class="post-comments__info_item post-comments__author">' + author.name + '</div>' +
                '<div class="post-comments__info_item post-comments__date"><i class="fa fa-clock"></i>' + currentDate + '</div>' +
                '<div class="post-comments__info_item post-comments__msg">' + message + '</div>' +
                replyBlock +
                '</div>' +
                '</div>' +
                '<div class="post-comments__children"></div> ' +
                '</div>'
            );
            if( object.children.length ){
                $.each(object.children, function(field, value){
                    childMessageTemplate(object,value);
                })
            }
        },
        childMessageTemplate = function (object, value) {
            var childAuthor = value.author,
                parentAuthor = $('#' + object.id),
                currentDate = setDate(value);
            var replyBlock;
            if( childAuthor.id == currentUser ){
                replyBlock = '<div class="post-comments__info_item post-comments__control-block">' +
                    '<span class="post-comments__control" data-message="delete"><i class="fas fa-times"></i>Delete</span>' +
                    '</div>'
            }
            else{
                return;
            }
            // console.log(childAuthor);
            parentAuthor.children('.post-comments__children').append(
                '<div id="' + value.id + '" class="post-comments__item" data-author="' + childAuthor.id + '">' +
                '<div class="post-comments__info_wrapper">' +
                '<div class="post-comments__avatar">' +
                '<img class="user__avatar" src="' + childAuthor.avatar + '">' +
                '</div>' +
                '<div class="post-comments__info">' +
                '<div class="post-comments__info_item post-comments__author">' + childAuthor.name + '</div>' +
                '<div class="post-comments__info_item post-comments__control post-comments__reply-to"><i class="fas fa-reply"></i>' + object.author.name + '</div>' +
                '<div class="post-comments__info_item post-comments__date"><i class="fa fa-clock"></i>' + currentDate + '</div>' +
                '<div class="post-comments__info_item post-comments__msg">' + value.content + '</div>' +
                replyBlock +
                '</div>' +
                '</div>' +
                '</div>'
            );
        };


    function getList(count, offset){
        $.ajax({
            type: 'GET',
            url: "http://frontend-test.pingbull.com/pages/" + email + "/comments",
            data: {
                'count': count,
                'offset': offset
            },
            success: function (data, status) {
                console.log( data)
                $.each(data, function (key, object) {
                 parentMessageTemplate(object);

                });

            }
        });
    }

    getList(messagesNumber, messagesOffset);


    //Show editor
    messageList.on('click', '[data-message="edit"]',function () {
        var parent = $(this).closest('[data-info]');
        parent.find('[data-message="replier"]').addClass('hidden');
        if(parent.find('[data-message="editor"]').length){
            parent.find('[data-message="editor"]').toggleClass('hidden');
        }
        else{
            parent.append(
                '<div class="post-comments__form" data-message="editor">' +
                '<div class="post-comments__form_controls clearfix">' +
                '<span class="post-comments__control" data-message="cancel"><i class="fas fa-times"></i>Cancel</span>' +
                '</div>' +
                '<form action="#" class="form" method="post">' +
                '<div class="form-block clearfix">' +
                '<textarea name="current-message" class="post-comments__textarea" name="message" id="" cols="30" rows="4" placeholder="Your message"></textarea>' +
                '</div>' +
                '<div class="form-block form-block--submit">' +
                '<input type="button" class="form-submit" data-message="submit" value="Edit">' +
                '</div>' +
                '</form>' +
                '</div>'
            )
        }
    });

    //Show replier
    messageList.on('click', '[data-message="reply"]',function () {
        var parent = $(this).closest('[data-info]'),
            author = parent.find('.post-comments__author').text();
        parent.find('[data-message="editor"]').addClass('hidden');
        if(parent.find('[data-message="replier"]').length){
            parent.find('[data-message="replier"]').toggleClass('hidden');
        }
        else{
            parent.append(
                '<div class="post-comments__form" data-message="replier">' +
                '<div class="post-comments__form_controls clearfix">' +
                '<span class="post-comments__control post-comments__reply-to"><i class="fas fa-reply"></i>' + author + '</span>' +
                '<span class="post-comments__control" data-message="cancel"><i class="fas fa-times"></i>Cancel</span>' +
                '</div>' +
                '<form action="#" class="form" method="post">' +
                '<div class="form-block clearfix">' +
                '<textarea name="current-message" class="post-comments__textarea" data-message="reply-msg" name="message" id="" cols="30" rows="4" placeholder="Your message"></textarea>' +
                '</div>' +
                '<div class="form-block form-block--submit">' +
                '<input type="button" class="form-submit" data-message="create" value="Send">' +
                '</div>' +
                '</form>' +
                '</div>'
            )
        }
    });

    //Close message field
    messageList.on('click', '[data-message="cancel"]',function () {
        $(this).closest('.post-comments__form').addClass('hidden');
    });


    //Edit message
    messageList.on('click', '[data-message="editor"] [data-message="submit"]' ,function () {
        var parent = $(this).closest('[data-message="editor"]'),
            newValue = parent.find('.post-comments__textarea').val(),
            currentMessageId  = $(this).closest('[data-author]').attr('id'),
            updatedDate = new Date();
        if(newValue.length){
            $.ajax({
                    type: "PUT",
                    url: "http://frontend-test.pingbull.com/pages/test@email.com/comments/" + currentMessageId,
                    data: {
                        'content' : newValue,
                        'updated_at' : updatedDate
                    },
                    success: function (data) {
                        var currentMessage  = $('[data-message="list"]').find('#' + data.id).children('[data-info]');
                        currentMessage.find('.post-comments__msg').text(newValue);
                        currentMessage.find('[data-message="editor"]').addClass('hidden');
                        currentMessage.find('.post-comments__textarea').val('');
                    }

                }
            )
        }
    });

    //Add new comment
    $('[data-message="create"]').on('click', function(){
        var parent = $(this).closest('[data-message="new"]'),
            newMsg = $('[data-message="new-msg"]', parent);

        if(newMsg.val().length){
            $.ajax({
                    type: "POST",
                    url: "http://frontend-test.pingbull.com/pages/" + email + "/comments/",
                    data: {
                        'content' : newMsg.val(),
                    },
                    success: function (object, status) {
                        console.log(object);
                        getCommentsNumber();
                        var author = object.author,
                            message = object.content,
                            currentDate = setDate(object),
                            replyBlock = '<div class="post-comments__info_item post-comments__control-block">' +
                                '<span class="post-comments__control" data-message="edit"><i class="fas fa-edit"></i>Edit</span>' +
                                '<span class="post-comments__control" data-message="delete"><i class="fas fa-times"></i>Delete</span>' +
                                '<span class="post-comments__control" data-message="reply"><i class="fas fa-reply"></i>Reply</span>' +
                                '</div>';
                        $('[data-message="list"]').prepend(
                            '<div id="' + object.id + '" class="post-comments__item" data-author="' + author.id + '">' +
                            '<div class="post-comments__info_wrapper" data-info>' +
                            '<div class="post-comments__avatar">' +
                            '<img class="user__avatar" src="' + author.avatar + '">' +
                            '</div>' +
                            '<div class="post-comments__info">' +
                            '<div class="post-comments__info_item post-comments__author">' + author.name + '</div>' +
                            '<div class="post-comments__info_item post-comments__date"><i class="fa fa-clock"></i>' + currentDate + '</div>' +
                            '<div class="post-comments__info_item post-comments__msg">' + message + '</div>' +
                            replyBlock +
                            '</div>' +
                            '</div>' +
                            '<div class="post-comments__children"></div> ' +
                            '</div>'
                        );
                        console.log(messageList.children().length);
                        if( messageList.children().length > messagesNumber ){
                            messageList.children().last().remove();
                        }
                        console.log();
                        newMsg.val('');


                    }

                }
            )
        }
        else{
            alert('Nothing to comment');
        }


    });

    //Reply comment
    messageList.on('click', '[data-message="create"]' ,function(){
        var parent = $(this).closest('[data-author]'),
            replyMsg = $('[data-message="reply-msg"]', parent),
            that = $(this);

        if(replyMsg.val().length){
            $.ajax({
                    type: "POST",
                    url: "http://frontend-test.pingbull.com/pages/" + email + "/comments/",
                    data: {
                        'content' : replyMsg.val(),
                        'parent': parent.attr('id')
                    },
                    success: function (object, status) {
                        console.log(object.parent);
                        that.closest('[data-message="replier"]').addClass('hidden');

                        var author = object.author,
                            message = object.content,
                            currentDate = setDate(object),
                            replyBlock = '<div class="post-comments__info_item post-comments__control-block">' +
                                '<span class="post-comments__control" data-message="delete"><i class="fas fa-times"></i>Delete</span>' +
                                '</div>';
                       parent.children('.post-comments__children').append(
                           '<div id="' + object.id + '" class="post-comments__item" data-author="' + author.id + '">' +
                           '<div class="post-comments__info_wrapper">' +
                           '<div class="post-comments__avatar">' +
                           '<img class="user__avatar" src="' + author.avatar + '">' +
                           '</div>' +
                           '<div class="post-comments__info">' +
                           '<div class="post-comments__info_item post-comments__author">' + author.name + '</div>' +
                           '<div class="post-comments__info_item post-comments__control post-comments__reply-to"><i class="fas fa-reply"></i>' + parent.find('.post-comments__author:first').text() + '</div>' +
                           '<div class="post-comments__info_item post-comments__date"><i class="fa fa-clock"></i>' + currentDate + '</div>' +
                           '<div class="post-comments__info_item post-comments__msg">' + message + '</div>' +
                           replyBlock +
                           '</div>' +
                           '</div>' +
                           '</div>'
                        );
                        replyMsg.val('');

                    }

                }
            )
        }
        else{
            alert('Nothing to comment');
        }


    });

    //Delete comment
    messageList.on('click', '[data-message="delete"]', function(){
      var parent = $(this).closest('[data-author]');
        $.ajax({
                type: "DELETE",
                url: "http://frontend-test.pingbull.com/pages/" + email + "/comments/" + parent.attr('id'),
                success: function (object, status) {
                    parent.remove();
                    getCommentsNumber();
                    $.ajax({
                        type: "GET",
                        url: "http://frontend-test.pingbull.com/pages/" + email + "/comments",
                        success: function(object, status){
                            var messagesNumber = parseInt(object.length) -1,
                                newMessage = object[messagesNumber];
                            if( messagesNumber >=  4 && messageList.children().length < 5 ){
                                parentMessageTemplate(newMessage);
                            }
                        }
                    })
                }

            }
        );

    });

    //load more comments
    $('[data-message="load-more"]').on('click', function(){

        $.ajax({
            type: 'GET',
            url: "http://frontend-test.pingbull.com/pages/" + email + "/comments",
            data: {
                'count': 100,
            },
            success: function (data, status) {

                console.log( data.length);
                if(messageList.children().length < data.length){
                    messagesNumber += 5;
                    messageList.html('');
                    getList(messagesNumber);
                }
                else {
                    alert('Nothing to load')
                }
            }
        });


    })

    //comments number

    function getCommentsNumber(){
        $.ajax({
            type: 'GET',
            url: "http://frontend-test.pingbull.com/pages/" + email + "/comments",
            data: {
                'count': 100,
            },
            success: function (data, status) {

                console.log( data.length);
                var numberMessage;
                if( data.length === 1 ){
                    numberMessage = 'comment'
                }
                else{
                    numberMessage = 'comments'
                }
                $('.post-info__item--comments span').text(data.length + ' ' + numberMessage);

            }
        });
    }

    getCommentsNumber();



    });