---
title: "Cloudinary content backup"
date: "2019-12-13T16:43:54+01:00"
description: 'Right after migrating all my images onto Cloudinary I started to question myself: how am I going to make backups?'
tags:
    - Cloudinary
    - Python
    - backup
categories:
    - software development
author: Dmitry Kann
image: "/images/logos/cloudinary-logo.png"
---

Right after {{< a "https://yktoo.com/en/blog/post/2019/11/04-cloudinary-is-the-new-image-hosting-for-yktoo.com/" "migrating" >}} all my images onto {{< a "https://cloudinary.com/invites/lpov9zyyucivvxsnalc5/l6ccxxrfxv0mdc6iewg8" "Cloudinary" >}} I started to question myself: how am I going to make backups?

Nothing lasts forever, including clouds. Or, for example, one day you can lose your Cloudinary account and hence your access to the hosting altogether. Therefore the task of making a copy of your content is quite relevant.

<!--more-->

Paid Cloudinary plans offer the function of backing up into an *Amazon S3 bucket*. This feature is, however, not available on their free plan.

## Backup script

I didn't have a minute doubt it would be easy to write an automated backup script, given the variety of {{< a "https://cloudinary.com/documentation/cloudinary_references" "APIs" >}} Cloudinary provides.

And indeed, it cost me less than an hour to write a snappy Python program that downloads all images and videos onto your local drive. Meet {{< a "https://github.com/yktoo/yktoo.com/blob/master/_dev_/cloudinary-backup" "cloudinary-backup" >}}!

### Getting started

In order to use the script:

* Install the "cloudinary" package by running `sudo pip3 install cloudinary` .
* Export the `CLOUDINARY_URL` environment variable to be `cloudinary://<api_key>:<api_secret>@<cloud_name>`. This value can be easily copied in your Cloudinary Dashboard.
* Adjust the `BACKUP_DIR` variable in the {{< a "https://github.com/yktoo/yktoo.com/blob/master/_dev_/cloudinary-backup" "script's" >}} header to point to the desired local folder.

### Running

Once the above is done, the script can be simply run (you can use the `-v` command-line option to get more verbose output):

{{< imgfig "https://res.cloudinary.com/yktoo/image/upload/blog/sau6blvq4tvsnwpjjpg1.gif" "Cloudinary backup script in action." >}}

The program compares the cloud content with its local version and downloads only those files that are either missing or differ in size.

One thing worth mentioning here is that the *Admin API*, which is used to retrieve resource lists, is rate-limited.

On the other hand, the limit is set at 500 requests per hour, and each request can fetch up to 500 items, which means if you host less than **250 K** files, you're probably fine.

## Removing redundant files

If the program is started with the `-d` command line switch, local files that aren't present in Cloudinary will be automatically cleaned up.

## Source code

The source code of the script is {{< a "https://github.com/yktoo/yktoo.com/blob/master/_dev_/cloudinary-backup" "available on GitHub" >}}.