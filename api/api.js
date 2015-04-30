	var plugin = {},
      	common = require('../../../api/utils/common.js'),
    	plugins = require('../../pluginManager.js'),
   	fetch = require('../../../api/parts/data/fetch.js'),
   	Hipchatter = require('../node_modules/hipchat-client');

(function (plugin) {
	
	
	plugins.register("/o/hipchat", function(ob){
		var params = ob.params;
		var paths = ob.paths;
		var validateUserForDataReadAPI = ob.validateUserForDataReadAPI;
		var urlString = paths.join('/');
		console.log(urlString.trim());
		switch(urlString.trim()){
			//Example: <base_path>/o/hipchat/token/save?api_key=:api_key&adminAuthToken=:adminAuthToken
			case '/o/hipchat/token/save':
				console.log(urlString.trim());
				console.log("====got it====");
				updateUser = {};
				updateUser.hipchat = {
					"authToken": params.qstring.adminAuthToken,
					"rooms": {}
				}

				common.db.collection("members").update({
				 		'api_key': params.qstring.api_key
						 }, {
							$set: updateUser
						}, {
							safe: true
						}, function(err, member) {
							if (member && !err) {
								console.log("=== data saved ====");
								common.returnMessage(params, 200, "success");
								
							} else {
								console.log("=== data not saved ====");
								common.returnMessage(params, 401, 'User does not exist');
								
							}
						});
				break;
			//Example: <base_path>/o/hipchat/setting/list/rooms?api_key=:api_key
			case '/o/hipchat/setting/list/rooms':
				console.log("I have switched");
				var roomList = new Array();
				common.db.collection("members").findOne({
					'api_key': params.qstring.api_key
				}, function(err, member) {
					console.log(member);
					if (member.hipchat && member.hipchat.authToken) {
						var authKey = member.hipchat.authToken;
						var hipchatter = new Hipchatter(authKey);

						hipchatter.api.rooms.list({}, function(err, room) {
							if (err) {
								console.log(err);
								common.returnMessage(params, 401, 'HipChat unable to load rooms');
								return false;
							} else {
								common.returnOutput(params,room);
							}

						});
					} else {
						common.returnMessage(params, 200,"authToken doest not exists");
					}

				});
				break;
			//Example: <base_path>/o/hipchat/setting/user/rooms?api_key=:api_key
			case '/o/hipchat/setting/user/rooms':
				var roomList = new Array();
				common.db.collection("members").findOne({
					'api_key': params.qstring.api_key
				}, function(err, member) {
					var rooms = [];
					if (member.hipchat && member.hipchat.rooms) {
						console.log("== stored member ====");
						console.log(member);
						common.returnOutput(params,member.hipchat.rooms);
					} else {
						console.log("== there is no room for this user ====");
						common.returnMessage(params, 401, 'Unable to store room');
					}

				});

				break;
			//Example: <base_path>/o/hipchat/setting/user/rooms?api_key=:api_key&rooms={id:101 ......}&app_id=:app_id&adminAuthToken=:adminAuthToken
			case '/o/hipchat/save/room':
				console.log("=== save room request ====");
				var room = JSON.parse(params.qstring.room);
				common.db.collection("members").findOne({
					'api_key': params.qstring.api_key
				}, function(err, member) {
					console.log(member);

					var roomApp = {};
					roomApp.hipchat = {
						"adminAuthToken": room.adminAuthToken,
						"room_id": room.id,
						"authToken": room.authToken
					};
					common.db.collection("apps").update(
						{
							"_id":common.db.ObjectID(room.app_id)
						}, {
							$set: roomApp
						}, {
							safe: true
						}, function(err, app) {
							console.log("====room save into app==");
						}
					);

					var oldRooms = {};
					oldRooms.hipchat = {
						"authToken": room.adminAuthToken,
						"rooms": member.hipchat.rooms
					};
					console.log(oldRooms.hipchat);
					oldRooms.hipchat.rooms[room.app_id] = room;
					common.db.collection("members").update({
						'api_key': params.qstring.api_key
					}, {
						$set: oldRooms
					}, {
						safe: true
					}, function(err, member) {
						console.log("== after update member object become == ");
						console.log(member);
						if (member && !err) {
							console.log("====room saved====");
							common.returnMessage(params, 200, 'success');

						} else {
							console.error(err);
							common.returnMessage(params, 401, 'Unable to save room');
						}
					});

				});

				
				break;
			//Example: <base_path>/o/hipchat/room/edit?api_key=:api_key&app_id=:app_id
			case '/o/hipchat/room/edit':
				console.log("=== edit parameter ===");
				console.log(params.qstring.app_id);

				common.db.collection("members").findOne({
					'api_key': params.qstring.api_key
				}, function(err, member) {
					if (!err) {
						var editRoom = {};
						editRoom = member.hipchat.rooms[params.qstring.app_id];
						common.returnOutput(params,editRoom);
					} else {
						common.returnMessage(params, 200, 'Unable to edit room');
					}
				});
				break;
			//Example: <base_path>/o/hipchat/room/delete?api_key=:api_key&app_id=:app_id
			case '/o/hipchat/room/delete':
				
				common.db.collection("members").findOne({
					'api_key': params.qstring.api_key
				}, function(err, member) {
					console.log("=== enter to delete hipchat ==");
					common.db.collection("apps").findOne({"_id":common.db.ObjectID(params.qstring.app_id)},function(err,app){
						if(err){
							console.log(err);
						}else{
							
							delete app["hipchat"];
							console.log(params.qstring.app_id);
							common.db.collection("apps").update(
								{
									"_id": common.db.ObjectID(params.qstring.app_id)
								},{
									$set: app
								}, {
									safe: true
								},function(err,app){
									if(err){
										console.log(err);
									}else{

										console.log("=== app hipchat property delete ==");
									}
									
							});
						}
					});

					var oldRooms = {};
					oldRooms.hipchat = {
						"authToken": member.hipchat.authToken,
						"rooms": member.hipchat.rooms
					};

					delete oldRooms.hipchat.rooms[params.qstring.app_id];
					common.db.collection("members").update({
						'api_key': params.qstring.api_key
					}, {
						$set: oldRooms
					}, {
						safe: true
					}, function(err, member) {
						console.log("== after update member object become == ");
						console.log(member);
						if (member && !err) {
							common.returnMessage(params, 200, 'success');
						} else {
							console.error(err);
							common.returnMessage(params, 200, 'Unable to delete room');
						}
					});

				});
				break;

		}

		return true;
		
	});
	
	plugins.register("/session/begin", function(ob){
		var appId = ob.appId;
		//console.log("session has been begin");
		//console.log(ob.params.app_id);
		common.db.collection("apps").findOne({"_id":common.db.ObjectID(ob.params.app_id)},function(err,app){
			if(err){
				//console.log(err);
			}else{
				if(app.hipchat.adminAuthToken){
					var hipchatter = new Hipchatter(app.hipchat.adminAuthToken);
					hipchatter.api.rooms.message({
					  room_id: app.hipchat.room_id,
					  from: 'Countly-client',
					  message: 'Session begin',
					  format: 'text',
					  color: 'green',
					  notify: 1
					}, function (err, response) {
					 	if (err) { 
					 		console.log(err);
					  	}else{
					  		console.log("message delivered");
					 		console.log(response);
					  	}
								  
					});
				}else{
					console.log("adminAuthToken doesnt exists");
				}
				
			}
			

		});

	});
	
	plugins.register("/session/end", function(ob){
		var appId = ob.appId;
		
		console.log("session has been ended");
		console.log(ob.params.app_id);
		common.db.collection("apps").findOne({"_id":common.db.ObjectID(ob.params.app_id)},function(err,app){
			if(err){
				//console.log(err);
			}else{
				//console.log(app);
				if(app.hipchat.adminAuthToken){
					var hipchatter = new Hipchatter(app.hipchat.adminAuthToken);
					hipchatter.api.rooms.message({
					  room_id: app.hipchat.room_id,
					  from: 'Countly-client',
					  message: 'Session end',
					  format: 'text',
					  color: 'green',
					  notify: 1
					}, function (err, response) {
					 	if (err) { 
					 		console.log(err);
					  	}else{
					  		console.log("message delivered");
					 		console.log(response);
					  	}
								  
					});
				}else{
					console.log("authAdminToken doesnt exists");
				}
				
			}
			

		});
	});

	
	 plugins.register("/i/events", function(ob){
		var appData = ob.params;
		var eventData = ob.currEvent;
		console.log(appData);		
		if(appData.iap_event == eventData.key){
			console.log("event match");	
			common.db.collection("apps").findOne({"_id":common.db.ObjectID(appData.app_id)},function(err,app){
				if(err){
					console.log(err);
				}else{
					//console.log(app);
					if(app.hipchat.adminAuthToken){
						var hipchatter = new Hipchatter(app.hipchat.adminAuthToken);
						hipchatter.api.rooms.message({
						  room_id: app.hipchat.room_id,
						  from: 'Countly-client',
						  message: eventData.key + "event has been occurred",
						  format: 'text',
						  color: 'green',
						  notify: 1
						}, function (err, response) {
						 	if (err) { 
						 		console.log(err);
						  	}else{
						  		console.log("message delivered");
						 		console.log(response);
						  	}
									  
						});
					}else{
						console.log("authAdminToken doesnt exists");
					}
					
				}
			

			});
		}else{
			console.log("event doesnt match");
		}
		


		
	});

	
}(plugin));

module.exports = plugin;