# BlueQuest secure account backend

BlueQuest Core remains free and offline. Protected modules are not trusted to the APK.

## Security model
- Supabase Auth issues the account JWT.
- PostgreSQL Row Level Security controls what a user may read.
- `user_entitlements` is readable by the owner but writable only by trusted server code.
- `social_connections` is readable by the owner but writable only by trusted server code.
- `protected_content` can be read only when the current account has the required entitlement.
- Never put a Supabase service-role key, Discord client secret, Google client secret or bot token in the APK.

## Suggested entitlement keys
- `community`
- `boss_atlas`
- `fishing_tools`
- `gold_saucer`
- `cloud_sync`
- `supporter`

## Social verification
Discord verification should use OAuth2 with `identify guilds.members.read` and verify membership server-side.
YouTube verification should use OAuth2 and the YouTube Data API, checking the authenticated account's subscriptions server-side.

The app may be freely shared. Sharing the APK does not grant protected entitlements.
