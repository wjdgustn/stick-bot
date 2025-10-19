```yaml
services:
  app:
    image: ghcr.io/wjdgustn/stick-bot:main
    restart: unless-stopped
    extra_hosts:
      - host.docker.internal:host-gateway
    labels:
      com.centurylinklabs.watchtower.enable: true
    environment:
      TOKEN: BOT_TOKEN
      
      OWNERS: id
      
      JEJUDO_PREFIX: ;
      
      ACTIVITIES_CHANGE_INTERVAL: 10000
      ACTIVITIES: /patch to view patch note;/invite to invite the bot;working on {servercount} servers
      
      MONGODB_HOST: host.docker.internal
      MONGODB_PORT: 27017
      MONGODB_USER: root
      MONGODB_PASSWORD: pass
      MONGODB_DATABASE: StickBot
```