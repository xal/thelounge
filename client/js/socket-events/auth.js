"use strict";

const $ = require("jquery");
const socket = require("../socket");
const storage = require("../localStorage");
const utils = require("../utils");
const templates = require("../../views");
const {vueApp} = require("../vue");

socket.on("signed-up", function(data) {
	const login = $("#sign-in");

	const signMessage = login.find(".sign_form_message");

	if (!data.success) {
		switch (data.errorType) {
			case "invalid":
				signMessage.text("Invalid username or password");
				break;
			case "already_exist":
				signMessage.text("User already exist");
				break;
			default:
				signMessage.text("Unknown error");
				break;
		}
	} else {
		signMessage.text("Success sign up");
	}

	signMessage
		.show()
		.closest("form")
		.one("submit", function() {
			signMessage.hide();
		});

	login.find(".btn").prop("disabled", false);
});

socket.on("auth", function(data) {
	// If we reconnected and serverHash differs, that means the server restarted
	// And we will reload the page to grab the latest version
	if (utils.serverHash > -1 && data.serverHash > -1 && data.serverHash !== utils.serverHash) {
		socket.disconnect();
		vueApp.isConnected = false;
		vueApp.currentUserVisibleError = "Server restarted, reloading…";
		location.reload(true);
		return;
	}

	const login = $("#sign-in");

	const signMessage = login.find(".sign_form_message");

	signMessage.hide();

	if (data.serverHash > -1) {
		utils.serverHash = data.serverHash;

		login.html(templates.windows.sign_in(data));

		utils.togglePasswordField("#sign-in .reveal-password");

		let isSignIn = true;

		$("#btn_sign_up").click(function(_) {
			isSignIn = false;
			return true;
		});

		$("#btn_sign_in").click(function(_) {
			isSignIn = true;
			return true;
		});

		login.find("form").on("submit", function() {
			const form = $(this);

			onSignFormSubmitted(form, isSignIn);

			return false;
		});
	} else {
		login.find(".btn").prop("disabled", false);
	}

	let token;
	const user = storage.get("user");

	if (!data.success) {
		if (login.length === 0) {
			socket.disconnect();
			vueApp.isConnected = false;
			vueApp.currentUserVisibleError = "Authentication failed, reloading…";
			location.reload();
			return;
		}

		storage.remove("token");

		signMessage.text("Authentication failed.");
		signMessage
			.show()
			.closest("form")
			.one("submit", function() {
				signMessage.hide();
			});
	} else if (user) {
		token = storage.get("token");

		if (token) {
			vueApp.currentUserVisibleError = "Authorizing…";
			$("#loading-page-message").text(vueApp.currentUserVisibleError);

			let lastMessage = -1;

			for (const network of vueApp.networks) {
				for (const chan of network.channels) {
					if (chan.messages.length > 0) {
						const id = chan.messages[chan.messages.length - 1].id;

						if (lastMessage < id) {
							lastMessage = id;
						}
					}
				}
			}

			const openChannel = (vueApp.activeChannel && vueApp.activeChannel.channel.id) || null;

			socket.emit("auth", {user, token, lastMessage, openChannel});
		}
	}

	if (user) {
		login.find("input[name='user']").val(user);
	}

	if (token) {
		return;
	}

	$("#loading").remove();
	$("#footer")
		.find(".sign-in")
		.trigger("click", {
			pushState: false,
		});
});

function onSignFormSubmitted(form, isSignIn) {
	form.find(".btn").prop("disabled", true);

	const values = {};
	$.each(form.serializeArray(), function(i, obj) {
		values[obj.name] = obj.value;
	});

	storage.set("user", values.user);

	if (isSignIn) {
		socket.emit("auth", values);
	} else {
		socket.emit("sign-up", values);
	}
}
