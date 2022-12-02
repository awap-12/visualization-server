OAuth2.0 understanding

grant type we are going to use:

1. authorization code grant:

```mermaid
sequenceDiagram
	autonumber
	participant member's
	participant user
	member's->>user: request authorization code https://.../oauth/authorize?response_type=code&client_id=''&redirect_uri=''&state=''&scope=''
	user-->>member's: return a code
	member's->>user: request token http://.../oauth/token?client_id=''&client_secret=''&grant_type=authorization_code&code=''&redirect_uri=''
	user-->>member's: return a token {accessToken,refreshToken}
```

2. password grant:

```mermaid
sequenceDiagram
	autonumber
	participant member's
	participant user
	member's->>user: request a token https://.../oauth/token?grant_type=password&username=''&password=''&client_id=''
	user-->>member's: return a token
```

But we could share our data with password grant model

- user model

## Test page

### Development

start npm script: `npm start:user`

visit address: http://localhost:3000/? + settings

### Production

start npm script: `npm start`

visit address: http://localhost:3000/api/user? + settings
