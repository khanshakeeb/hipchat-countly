window.HipchatView = countlyView.extend({
			_roomList: {},
			_userRoomList: {},
			initialize: function() {

			},
			beforeRender: function() {
				if (!this.template) {
					var self = this;
					return $.when(countlyHipchat.getRooms(), countlyHipchat.getUserRooms(), $.get(countlyGlobal["path"] + '/hipchat/templates/hipchat.html', function(src) {
						self.template = Handlebars.compile(src);

					})).then(function() {
						HipchatView._roomList = countlyHipchat.getRoomsData();
						HipchatView._userRoomList = countlyHipchat.getUserRoomsData();
						console.log("==== room data via hipchat api");
						console.log(HipchatView._roomList);
						console.log("==== room data of user");
						console.log(countlyHipchat.getUserRoomsData());
					});
				}
			},
			renderCommon: function(isRefresh) {
				//var _adminAuthToken = countlyHipchat.getAdminAuthToken();
				this.templateData = {
					"page-title": jQuery.i18n.map["hipchat.title"],
					"logo-class": "frequency",
					"hipchat-admin-auth-token": countlyHipchat.getAdminAuthToken(),
					//"active-room"
					"hipchatRoomList": HipchatView._roomList,
					"appList": countlyHipchat.apps(),
					'userRooms': HipchatView._userRoomList
				};

				$(this.el).html(this.template(this.templateData));
				//hide create room form
				$('tr.user-details').hide();
				var self = this;

				//@todo: Move to helper method
				$("#hipchat-save").on('click', function() {
					var hipchatAuthTokenInput = $("#hipchat-auth-token").val();
					if (hipchatAuthTokenInput) {

						$.when(
							countlyHipchat.setAdminHipChatToken(hipchatAuthTokenInput)
						).then(function() {
							$.when(countlyHipchat.getRooms(), $.get(countlyGlobal["path"] + '/hipchat/templates/partials/create_rooms.html', function(src) {
								self.template = Handlebars.compile(src);


							})).then(function(data) {
								console.log("=== ajax promise success or error  ====");
								console.log(data);
								self.templateData.hipchatRoomList = countlyHipchat.getRoomsData();
								newPage = $("<div id='hipchat-room-container'>" + self.template(self.templateData) + "</div>");
								$('#hipchat-room-container').replaceWith(newPage);
								//Workover re-attached event handler to dropdown as it was not able to bind 
								applicationDropDownControl();
								roomDropDownControl();
								console.log("=== room data loaded via hipchat api ====");
								console.log(self.templateData.hipchatRoomList);
							});
						});

					} else {
						var message = jQuery.i18n.map["hipchat.field.adminAutheToken.validation"];
						CountlyHelpers.alert(message, "red");
						$("#hipchat-auth-token").focus();
					}

					return false;
				});
				
				//Bind click handler to application and room dropdown control
				applicationDropDownControl();
				roomDropDownControl();
			
				
				$('.test-notification').on('click',function(){
					console.log("hello world");
					$.when(countlyHipchat.sendTestMessageToRoom(),function(data){
						alert(data);
					});
					return false;
				});
				
				//@todo: Move to helper method

				$('.save-hipchat-room').live('click', function() {
					if (!$("#hipchat-room-id").val() && !$("#hipchat-room-name").val() && !$("#hipchat-app-name").val()) {
						CountlyHelpers.alert(jQuery.i18n.map["hipchat.hidden_fields.required"], "red");
					}
					var room = {
						"id": $("#hipchat-room-id").val(),
						"name": $("#hipchat-room-name").val(),
						"app_id": $("#hipchat-app-id").val(),
						"app_name": $("#hipchat-app-name").val(),
						"authToken": $("#hipchat-room-auth-token").val(),
						"adminAuthToken": countlyHipchat.getAdminAuthToken()
					}

					$.when(countlyHipchat.saveRoom(room)).then(function() {
						console.log("return promis of room save");
						$.when(countlyHipchat.getUserRooms(), $.get(countlyGlobal["path"] + '/hipchat/templates/partials/create_rooms.html', function(src) {
							self.template = Handlebars.compile(src);
							console.log("====compile room template==== ");
						})).then(function() {
							self.templateData.userRooms = countlyHipchat.getUserRoomsData();
							console.log(self.templateData.userRooms);
							newPage = $("<div id='hipchat-room-container'>" + self.template(self.templateData) + "</div>");
							$('#hipchat-room-container').replaceWith(newPage);
							//Workover re-attached event handler to dropdown as it was not able to bind 
							applicationDropDownControl();
							roomDropDownControl();
							console.log("===inject compile template =====");
							$('tr.user-details').hide();
						});

					});


				});
				
			//delete room
			deleteRoom();
			//cancel new room form
			cancelNewRoom();
			//edit room
			editRoom(self);
			//create new room form
			ceateNewRoom();	
	
	},
	refresh: function() {

	}
});


app.hipchatView = new HipchatView();
app.route('/manage/hipchat', 'hipchat', function() {
	this.renderWhenReady(this.hipchatView);
});

$(document).ready(function() {

	var menu = '<a href="#/manage/hipchat" class="item">' +
		'<div class="logo-icon icon-random"></div>' +
		'<div class="text" data-localize="hipchat.title"></div>' +
		'</a>';
	if ($('#management-submenu .help-toggle').length) {
		$('#management-submenu .help-toggle').before(menu);
	}
});



/////////////////////////////////////////////////////////////////////
// Helper methods which can be re-used  //
////////////////////////////////////////////////////////////////////



function applicationDropDownControl(){
	$('.hipchat-application-dropdown').on('click','.segmentation-option',function(){
		var app_id = $(this).attr('data-value');
		$("#hipchat-app-id").val(app_id);
		$("#hipchat-app-name").val($(this).html());
		console.log("application dropdown");
	});
}

function roomDropDownControl(){
	$('.hipchat-room-dropdown').on('click','.segmentation-option',function(){
		var room_id = $(this).attr('data-value');
		$("#hipchat-room-id").val(room_id);
		$("#hipchat-room-name").val($(this).html());
		console.log("drop down log");	
	});
}

function ceateNewRoom(){
	$('.create-new-room-button').live('click', function() {
		$('tr.user-details').show();
		return false;
	});

}



function cancelNewRoom(){
	$('.cancel-hipchat-room').live('click', function() {
		$('tr.user-details').hide();
		return false;
	});
}

function editRoom(self){
	$('.hipchat-edit-room').live('click', function() {
		var app_id = $(this).attr('data-value');
		$.when(countlyHipchat.editRoom(app_id), $.get(countlyGlobal["path"] + '/hipchat/templates/partials/create_rooms.html', function(src) {
			self.template = Handlebars.compile(src);
			console.log("====compile room template==== ");
		})).then(function() {

			var roomData = countlyHipchat.getRoomData();
			self.templateData.active_room = roomData.name;
			self.templateData.active_application = roomData.app_name;
			self.templateData.room_id = roomData.id;
			self.templateData.room_name = roomData.name;
			self.templateData.app_id = roomData.app_id;
			self.templateData.app_name = roomData.app_name;
			self.templateData.authToken = roomData.authToken;
			newPage = $("<div id='hipchat-room-container'>" + self.template(self.templateData) + "</div>");
			$('#hipchat-room-container').replaceWith(newPage);
			//Workover re-attached event handler to dropdown as it was not able to bind 
			applicationDropDownControl();
			roomDropDownControl();
			console.log("===inject compile template =====");
		});


		return false;
	});
}

function deleteRoom(){
	$('.hipchat-delete-room').live('click', function() {
		var app_id = $(this).attr('data-value');
		if (app_id) {
			$.when(countlyHipchat.deleteRoom(app_id)).then(function() {
				console.log("return promise of storing");
				$('.app_' + app_id).slideUp();
			});
		} else {
			CountlyHelpers.alert("Unable to find App ID", "red");
		}


		return false;
	});

}