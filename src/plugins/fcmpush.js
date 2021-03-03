const FCM = require("fcm-node");
const log = require("../log");

class FCMPush {
	constructor(fcmToken, enabled) {
		this.enabled = enabled;
		if (fcmToken === undefined || fcmToken === null || fcmToken === "") {
			this.initialized = false;
			log.warn(
				"Fail to init FCM push, server token not found. Mobile push messages disabed. Check fcmPush.serverToken section in config.js"
			);
		} else {
			this.fcm = new FCM(fcmToken);
			this.initialized = true;
			log.debug(
				"init FCMPush fcmServerToken '" + fcmToken + "' initialized " + this.initialized
			);
		}
	}

	pushToSingleClient(client, notification, data, collapse_key = "") {
		if (this.initialized && this.enabled) {
			if (client.fcmToken) {
				const message = {
					to: client.fcmToken,
					// without collapse_key field FCM don't handle message
					// shoud be replaced with unique collaps key
					collapse_key: "collapse_key",

					notification: notification,

					data: data,
				};

				this.fcm.send(message, function(err, response) {
					if (err) {
						log.error("Fail to send FCM message" + err, response);
					}
				});
			} else {
				// log.debug(
				// 	"FCMPush pushToSingleClient skipped because client fcmToken not received. Client not supports FCM or didn't sent FCM token on connecting"
				// );
			}
		}
	}
}

module.exports = FCMPush;
