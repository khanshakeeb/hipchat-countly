(function(countlyHipchat, $, undefined) {
	//private variables
	var _rooms = {};
	var _userRoom = {};
	var _room = {};
	//public methods

	/**
	 * getRooms method will fetch all the listed room from HipChat API
	 * @return {[type]}
	 */
	countlyHipchat.getRooms = function() {

		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/setting/list/rooms",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				//providing data
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("data stored into room variable");
				_rooms = json;

			},
			error: function(xhr, ajaxOptions, thrownError){
				_rooms = {};
				console.log("=== error in ajax call ====")
				console.log(thrownError);
			}
		});

	}

	countlyHipchat.getRoomsData = function() {
		console.log("now getting room data stored by ajax");
		return _rooms;
	}


	countlyHipchat.getUserRoomsData = function() {
		console.log("now getting room data stored by ajax");
		return _userRoom;
	}

	/**
	 * Countly user rooms
	 */
	countlyHipchat.getUserRooms = function() {

		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/setting/user/rooms",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				//providing data
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("=== user room data ===");
				_userRoom = json;

			}
		});


	}

	/**
	 * sendNotification will call hipChat api for notifications
	 * @return {[type]}
	 */
	countlyHipchat.sendNotification = function() {
		/**
		 * @todo: Call notification method for sending notification to hipchat
		 */
	}

	/**
	 * saveRoom method will help to save object into member object
	 * @return {[type]}
	 */
	countlyHipchat.saveRoom = function(room) {
		console.log(room);
		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/save/room",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				"app_id": room.app_id,
				"adminAuthToken": room.adminAuthToken,
				//providing data
				"room": JSON.stringify(room),
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log(json);
			}
		});


	}

	/**
	 * Fetch current save admin auth token so that
	 * user can call all the methods of HipChat API
	 * @return {[type]} [description]
	 */
	countlyHipchat.getAdminAuthToken = function() {
		if (countlyGlobal.member.hipchat && countlyGlobal.member.hipchat.authToken) {
			return countlyGlobal.member.hipchat.authToken;
		} else {
			return null;
		}

	}

	/**
	 * Get app object from current login user
	 * @return {[type]} [description]
	 */
	countlyHipchat.apps = function() {
		return countlyGlobal.apps ? countlyGlobal.apps : '';
	}

	countlyHipchat.setAdminHipChatToken = function(token) {
		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/token/save",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				//providing data
				"adminAuthToken": token,
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("save auth key for hipchat admin access");
			}
		});
	}

	/**
	 * Delete room
	 * @param  {[type]} room [description]
	 * @return {[type]}      [description]
	 */
	countlyHipchat.deleteRoom = function(app_id) {
		console.log("=== delete room method called ==");
		console.log(app_id);
		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/room/delete",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				"app_id" : app_id,
				//providing data
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("save auth key for hipchat admin access");
			}
		});
	}

	/**
	 * Get room object for edit
	 * @param  {[type]} app_id [description]
	 * @return {[type]}        [description]
	 */
	countlyHipchat.editRoom = function(app_id) {
		console.log("=== edit room method called ==");
		console.log(app_id);
		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "/o/hipchat/room/edit",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				"app_id" : app_id,
				//providing data
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("save auth key for hipchat admin access");
				_room = json;
			}
		});
	}

	countlyHipchat.getRoomData = function() {
		return _room;
	}

	countlyHipchat.sendTestMessageToRoom = function(){
		return $.ajax({
			type: "GET",
			url: countlyGlobal["path"] + "hipchat/setting/test/notification",
			data: {
				//providing current user's api key
				"api_key": countlyGlobal.member.api_key,
				//providing data
				_csrf: countlyGlobal['csrf_token']
			},
			success: function(json) {
				console.log("message send");
			}
		});
	}

})(window.countlyHipchat = window.countlyHipchat || {}, jQuery);