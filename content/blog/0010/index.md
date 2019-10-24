---
title: Installing MySQL Workbench in Ubuntu 19.04
date: "2019-09-20T10:16:54+0200"
description: >-
    MySQL Workbench, a very handy administration tool, has been removed from mainline Ubuntu repositories as of Ubuntu 19.04.

    Luckily, it isn't that difficult to get it installed.
tags:
    - Linux
    - MySQL
    - software development
    - Ubuntu
    - Disco Dingo
categories:
    - software development
author: "Dmitry Kann"
image: "mysql-workbench-screenshot.png"
---

[MySQL Workbench](https://www.mysql.com/products/workbench/) is a very handy administration tool. Unfortunately, it has been [removed](https://www.reddit.com/r/Ubuntu/comments/bg0zvd/mysql_workbench_not_available_in_ubuntu_1904/) from mainline Ubuntu repositories as of Ubuntu 19.04 Disco Dingo.

Luckily, it isn't that difficult to get it installed. You will need to use a binary `.deb` package provided by Oracle.

1. Navigate to https://dev.mysql.com/downloads/workbench/
2. Select **Ubuntu** as the operating system and **19.04** as version. {{< imgfig "install-step-1.png" >}}
3. Click **Download** and on the next screen **No thanks, just start my download** {{< imgfig "install-step-2.png" >}}
4. In the Terminal, navigate to the directory the `.deb` file has been downloaded to and run:
```bash
sudo dpkg -i mysql-workbench-community_8.0.17-1ubuntu19.04_amd64.deb
```
5. And, we're on! Start **MySQL Workbench** using the application menu: {{< imgfig "mysql-workbench-screenshot.png" >}}