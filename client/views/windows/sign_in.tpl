<form class="container" method="post" action="">
	<img src="img/logo-vertical-transparent-bg.svg" class="logo" alt="The Lounge" width="256" height="170">
	<img src="img/logo-vertical-transparent-bg-inverted.svg" class="logo-inverted" alt="The Lounge" width="256" height="170">

	<label>Username</label>
	<input class="input" type="text" name="user" autocapitalize="none" autocorrect="off" autocomplete="username" required autofocus>

	<div class="password-container">
		<label>Password</label>
		<input class="input" type="password" name="password" autocapitalize="none" autocorrect="off" autocomplete="current-password" required>
		{{> ../reveal-password}}
	</div>

	<div class="sign_form_message"></div>

	<button id="btn_sign_in" type="submit" class="btn">Sign in</button>
	{{#if signUp}}
	<button id="btn_sign_up" type="submit" class="btn">Sign up</button>
	{{/if}}
</form>
