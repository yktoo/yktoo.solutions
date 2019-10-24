---
title: "Self-hosting Commento with Docker Compose"
date: "2019-07-28T15:18:41+0200"
tags:
    - Linux
    - software
    - Commento
    - Docker
    - Docker Compose
    - cloud
categories:
    - software
description: >-
    A while ago I've made a decision to migrate off Disqus, which is arguably the most popular external commenting system for website owners, to the free and open-source **Commento**.
author: "Dmitry Kann"
image: "commento.png"
---

> TL;DR: I've developed an auto-deployable, self-hosted Commento configuration. Check out [this GitHub repository](https://github.com/yktoo/commento-docker-compose) and follow the [README](https://github.com/yktoo/commento-docker-compose/blob/master/README.md) to get started.

A while ago I've made a decision to migrate off Disqus, which is arguably the most popular external commenting system for website owners, to the free and open-source [Commento](https://commento.io/).

## Why Commento?

The problem with Disqus, as with many other "free" products, is that you're most likely the product here. It has a ridiculously huge footprint (think *megabytes*) and "enriches" your page with more than a *hundred* additional HTTP requests.

Next to that, it shows ads—which you can buy off at "only" $9/month with their Plus plan. How bad should it be to start searching for alternatives?

At some point I've stumbled upon [this blog post](https://victorzhou.com/blog/replacing-disqus/) and learned about the free commenting server called [Commento](https://commento.io/). Commento has gone fully free and open source just recently, deprecating the CE/EE freemium model being used before (applause to its developer Adhityaa Chandrasekar for that).

Commento beats Disqus in terms of load size by a huge margin, with a typical overhead of about **11 Kbytes** plus your comment data. The same goes for the number of additional HTTP requests.

It's also very fast, as its server code is written with Go.

And, last but not least, there's an import tool for Discus built-in. Is there anything else to wish?

## Options

For the non-tech-savvy folks Commento offers an off-the-peg cloud-hosted solution at [commento.io](https://commento.io/). The author asks you to pay as much as you wish, with a minimum of $3/month "for technical reasons".

By courtesy of Mr Chandrasekar there's also a free option of getting a Commento.io account "in exchange for contributing non-trivial patches".

Anyway, I've chosen for the third option, self-hosting a Commento server. This way you're not dependent on any third-party service (except for the hosting, of course), and I like being independent.

## Challenges

I'm a big fan of Docker containers and [Docker Compose](https://docs.docker.com/compose/), a tool that allows you to run a number of containers as an interconnected group. And Commento even provides a ready for use Docker image, hosted by the GitLab's container registry.

Therefore the decision to employ containers was a no-brainer for me.

Yet, there was a number of complications to solve.

### Issue 1: PostgreSQL

Commento needs a PostgreSQL server of a relatively recent version, and it wouldn't put up with any other SQL server, unfortunately.

Okay, that's an easy one as we're running containers anyway.

### Issue 2: No HTTPS support

Commento *is* a web server, but it only supports the unprotected HTTP protocol.

This isn't something unusual I must say. Nowadays it's pretty common to hide a sever group behind a [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy), which performs SSL offloading for you.

The thing is, the SSL/HTTPS support in this case isn't optional. It's now 2019 after all, you can't get away trying to authenticate your users using a clear-text internet protocol. It even sounds greasy.

My solution was to employ the [Nginx](https://www.nginx.com/) server as I've gained quite some experience with it during my past projects. It's fast, lightweight and mature. And it provides official [Docker images](https://hub.docker.com/_/nginx).

The second ingredient in the HTTPS course is the SSL certificate for your domain. I'm endlessly grateful to EFF and Mozilla for establishing the [Let's Encrypt](https://en.wikipedia.org/wiki/Let's_Encrypt) certificate authority, which hands out millions of free certificates monthly.

Let's Encrypt also distributes a free command-line tool called [certbot](https://certbot.eff.org/), which makes certificate issuing and renewals really easy. And—guess what—a Docker image for it, too!

### Issue 3: The Certbot's Chicken-Egg Problem

This is a tricky one.

We intend to reference the SSL certificate in the configuration of our Nginx reverse proxy, which means it won't start without a readable certificate.

At the same time, to issue a new SSL certificate for a domain, you need a working HTTP server that will prove to Let's Encrypt that you're actually owning this domain.

I managed to solve this, and quite elegantly, I may hope:

 1. First, a dummy (invalid) certificate gets generated, which is used to kick-start Nginx.
 2. Nginx and certbot interoperate to obtain a valid certificate.
 3. Once the certificate is at our disposal, certbot goes into a "standby mode", waking up once in 12 hours to check for renewal, as recommended by Let's Encrypt.
 4. When the certificate is actually renewed, certbot signals to Nginx that the latter must restart.
 
### Issue 4: Persistence

You probably want to retain your comment database across restarts and system upgrades, don't you?

Also, to avoid being banned by Let's Encrypt for sending renewal requests too frequently, you need to save the generated certificates until they are expired.

Both objectives are achieved in my bespoke Docker Compose configuration by using Docker *volumes*, which are created automatically by *systemd* when you start Commento the first time. The volumes are made `external`, securing them from being cleaned up with `docker-compose down -v`.

## The Big Picture

So let's see how it all comes together.

The diagram below illustrates the internal relationships and traffic flowing between the four containers:

{{< imgfig "docker-compose-diagram.svg" "Commento: a container relationship diagram." >}}

I used the `depends_on` functionality built into Docker Compose to make sure the containers get spinned up in the right order.

If you're only interested in setting up your very own Commento server, you can probably skip the rest and navigate to the [code on GitHub](https://github.com/yktoo/commento-docker-compose).

Below I'll delve into some technical details of my implementation.

## The Implementation Explained
 
### The Compose File

As you can see in the diagram above, the composition consists of four services:

1. `certbot` — certbot tool by the EFF
2. `nginx` — reverse proxy which does SSL offloading
3. `app` — Commento server
4. `postgres` — PostgreSQL database

The [`docker-compose.yml`](https://github.com/yktoo/commento-docker-compose/blob/master/docker-compose.yml) file declares an own Docker network called `commento_network` and three volumes, two of which are external (i.e. must be created outside of Compose):

* `commento_postgres_volume` contains PostgreSQL server data from Commento: users, moderators, comments etc.
* `certbot_etc_volume` stores certificates generated by `certbot`.


### Nginx

The Nginx container is built on top of the tiny Alpine-based official image and includes the following bootstrap script:

{{< highlight bash "linenos=table" >}}
#!/bin/sh

trap exit TERM

# Wait for the certificate file to arrive
wait_for_certs() {
    echo 'Waiting for config files from certbot...'
    i=0
    while [[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]]; do
        sleep 0.5
        [[ $((i++)) -gt 20 ]] && echo 'No files after 10 seconds, aborting' && exit 2
    done
}

# Watches for a "reload flag" (planted by certbot container) file and reloads nginx config once it's there
watch_restart_flag() {
    while :; do
        [[ -f /var/www/certbot/.nginx-reload ]] &&
            rm -f /var/www/certbot/.nginx-reload &&
            echo 'Reloading nginx' &&
            nginx -s reload
        sleep 10
    done
}

# Wait for certbot
wait_for_certs

# Start "reload flag" watcher
watch_restart_flag &

# Run nginx in the foreground
echo 'Starting nginx'
exec nginx -g 'daemon off;'
{{< / highlight >}}

* Line **3** registers an interrupt handler that takes care of a graceful Nginx and the background watch process shutdown when the container gets stopped.
* Line **27** calls a wait function that suspends Nginx startup until the SSL configuration files, generated by the `certbot` container, arrive. Nginx would fail to start otherwise.
* Line **30** starts a background process that checks the shared directory for a file named `.nginx-reload` every ten seconds and, once it's there, signals to Nginx to reload. This file is also created by certbot when it has obtained a renewed certificate.
* Line **34** performs a normal Nginx startup in the foreground. The `exec` command makes the current shell process be *replaced* by the Nginx process.

Another important file in this image is the commento virtual server config, which instructs Nginx to forward HTTPS requests to the `commento` container:

{{< highlight conf "linenos=table" >}}
server {
    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    server_tokens off;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name __DOMAIN__;

    location / {
        proxy_pass http://app:8080/;
        proxy_set_header Host            $http_host;
        proxy_set_header X-Real-IP       $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    ssl_certificate     /etc/letsencrypt/live/__DOMAIN__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN__/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_tokens off;

    server_name __DOMAIN__;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS on port 80
    location / {
        return 301 https://$host$request_uri;
    }
}
{{< / highlight >}}

The first server block (lines **1-21**) describes the HTTPS bit and the forwarding rule. It makes use of Let's Encrypt certificate files (or their placeholders).

The domain served by the server is passed as a build argument while generating the image; it replaces the `__DOMAIN__` placeholder in the server configuration.

The second server block (lines **23-38**) is the HTTP server configuration required for certbot to verify the domain ownership (to fulfil the so-called "ACME challenge"). All other requests get redirected to their HTTPS counterparts.


### certbot

Our certbot image is based on the [official image](https://hub.docker.com/r/certbot/certbot) with the addition of the following bootstrap script:

{{< highlight bash "linenos=table" >}}
#!/bin/sh

trap exit TERM

# Wait until nginx is up and running, up to 10 seconds
wait_for_nginx() {
    echo 'Waiting for nginx...'
    i=0
    while ! nc -z nginx 80 &>/dev/null; do
        sleep 0.5
        [[ $((i++)) -gt 20 ]] && echo "nginx isn't online after 10 seconds, aborting" && exit 4
    done
    echo 'nginx is up and running'
}

# Check vars
[[ -z "$DOMAIN" ]] && echo "Environment variable 'DOMAIN' isn't defined" && exit 2
[[ -z "$EMAIL"  ]] && echo "Environment variable 'EMAIL' isn't defined" && exit 2
TEST="${TEST:-false}"

# Check external mounts
data_dir='/etc/letsencrypt'
www_dir='/var/www/certbot'
[[ ! -d "$data_dir" ]] && echo "Directory $data_dir must be externally mounted"
[[ ! -d "$www_dir"  ]] && echo "Directory $www_dir must be externally mounted"

# If the config/certificates haven't been initialised yet
if [[ ! -e "$data_dir/options-ssl-nginx.conf" ]]; then

    # Copy config over from the initial location
    echo 'Initialising nginx config'
    cp /conf/options-ssl-nginx.conf /conf/ssl-dhparams.pem "$data_dir/"

    # Copy dummy certificates
    mkdir -p "$data_dir/live/$DOMAIN"
    cp /conf/privkey.pem /conf/fullchain.pem "$data_dir/live/$DOMAIN/"

    # Wait for nginx
    wait_for_nginx

    # Remove dummy certificates
    rm -rf "$data_dir/live/$DOMAIN/"

    # Run certbot to validate/renew certificate
    test_arg=
    $TEST && test_arg='--test-cert'
    certbot certonly --webroot -w /var/www/certbot -n -d "$DOMAIN" $test_arg -m "$EMAIL" --rsa-key-size 4096 --agree-tos --force-renewal

    # Reload nginx config
    touch /var/www/certbot/.nginx-reload

# nginx config has been already initialised - just give nginx time to come up
else
    wait_for_nginx
fi

# Run certbot in a loop for renewals
while :; do
    certbot renew
    # Reload nginx config
    touch /var/www/certbot/.nginx-reload
    sleep 12h
done
{{< / highlight >}}

A brief line tour:

* Line **3** is again required for a graceful container shutdown.
* Lines **17-19** validate the required variables.
* Lines **22-25** verify that the required directories are mounted as volumes.
* Then there's a split:
    * Lines **30-50** only get executed the first time the container is started:
        * A dummy certificate is copied to allow Nginx to start properly.
        * Nginx, in the meantime, waits for this process to finish and then proceeds with the startup.
        * Once Nginx is up and running, certbot initiates a proper certificate issuing process with Let's Encrypt.
        * And as the last step, when the certificate has arrived, `.nginx-reload` is created to indicate Nginx is to be restarted.
    * Line **54** waits for Nginx to come online should the certificates be already available.
* After that (lines **58-63**) it continues to run in the loop, checking for renewals every 12 hours and signalling Nginx to restart.


### Commento and PostgreSQL

The `app` and `postgres` containers use unaltered images provided by the vendors.

### Systemd Service

The last bit in this puzzle is the `commento.service` [systemd unit file](https://www.freedesktop.org/software/systemd/man/systemd.service.html), which is to be symlinked from `/etc/systemd/system/commento.service` so that it gets executed at the right moment during system bootup:

{{< highlight systemd "linenos=table" >}}
[Unit]
Description=Commento server

[Service]
TimeoutStopSec=30
WorkingDirectory=/opt/commento
ExecStartPre=-/usr/bin/docker volume create commento_postgres_volume
ExecStartPre=-/usr/bin/docker volume create certbot_etc_volume
ExecStartPre=-/usr/local/bin/docker-compose -p commento down -v
ExecStart=/usr/local/bin/docker-compose -p commento up --abort-on-container-exit
ExecStop=/usr/local/bin/docker-compose -p commento down -v

[Install]
WantedBy=multi-user.target
{{< / highlight >}}

The Lines:

* Line **6**: we assume the code is checked out at `/opt/commento` for simplicity.
* Lines **7-8** make sure the external volumes are created.
* Line **9** removes any possible leftovers from the previous run, however keeping the persistent external volumes.
* Line **10** is the actual start of Docker Compose. The flag `--abort-on-container-exit` shuts down the whole thing as soon as any container fails, so that systemd is at least aware the service isn't running anymore.
* Line **11** is again the cleanup of containers, networks and volumes.

## Source Code

A complete implementation that only requires updating variables in `docker-compose.yml` is [available on GitHub](https://github.com/yktoo/commento-docker-compose).

In order to get started, just carefully follow the steps in the [README](https://github.com/yktoo/commento-docker-compose/blob/master/README.md).

This code is distributed on the terms of the [MIT License](https://opensource.org/licenses/MIT).

Thanks for reaching this far! As always, I'd love your feedback using the new shiny comment section down below, which is run by the code from this post.
