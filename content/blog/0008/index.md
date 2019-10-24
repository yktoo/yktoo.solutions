---
title: "Sound Switcher Indicator 2.2.2"
date: "2019-07-21T17:23:25+0200"
tags:
    - Linux
    - software
    - Sound Switcher Indicator
    - Ubuntu
categories:
    - software
author: "Dmitry Kann"
image: "/images/logos/sound-switcher-indicator-800.png"
---

The version **2.2.2** of Sound Switcher Indicator has been released. It immediately follows the version **2.2.1** and includes a hotfix for the PulseAudio auto-reconnect feature.

<!--more-->

## What's new

There are the following changes:

* **Version 2.2.2**
  * Retries are too frequent when reconnecting to PulseAudio ([#79](https://github.com/yktoo/indicator-sound-switcher/issues/79))
* **Version 2.2.1**
  * Reconnect to PulseAudio if the connection is lost, up to 100 times ([#45](https://github.com/yktoo/indicator-sound-switcher/issues/45))
  * Don't allow multiple indicator instances for same user ([#60](https://github.com/yktoo/indicator-sound-switcher/issues/60))
  * Add support for using Ayatana AppIndicators ([#78](https://github.com/yktoo/indicator-sound-switcher/issues/78))
  * Virtual port config is always an object, too
  * Downgrade Python requirement from 3.6 to 3.5 ([#72](https://github.com/yktoo/indicator-sound-switcher/issues/72)) — thanks to [Youri De Bondt](https://github.com/ydbondt)
  * Make app description consistent ([#77](https://github.com/yktoo/indicator-sound-switcher/issues/77))
  * Update French translation ([#75](https://github.com/yktoo/indicator-sound-switcher/issues/75)) — thanks to [AO-LocLab](https://github.com/AO-LocLab)!

The two most notable changes are:

* The indicator won't start another instance for the same OS user:
  {{< imgfig "single-instance-only.gif" "Only one instance of the application is allowed." >}}
* The application will now try to reconnect to the PulseAudio server automatically if the connection fails, up to 200 seconds: 
  {{< imgfig "auto-pulseaudio-reconnect.gif" "The indicator tries to reconnect to PulseAudio automatically." >}}

## Other business

[Faidon Liambotis](https://github.com/paravoid) has laid the groundwork for publishing the indicator package in Debian upstream.

We're currently dusting and polishing the application in order to prepare for it, and it'll be great if we pull it off.

## Linux support

This is the first release that doesn't refer to Ubuntu or GNOME in its documentation. As it [turns out](https://github.com/yktoo/indicator-sound-switcher/issues/77#issuecomment-513497423), pretty much any desktop environment should be fit for running it.

For the fellow Ubuntu mates, my PPA provides packages for Ubuntu **18.04 Bionic LTS**, **18.10 Cosmic** and **19.04 Disco** (read [how to install](https://github.com/yktoo/indicator-sound-switcher/blob/master/doc/install.md)). Bug reports are welcome at the [usual address](https://github.com/yktoo/indicator-sound-switcher/issues/).
